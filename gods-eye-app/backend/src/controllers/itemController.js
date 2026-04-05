const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');
const { uploadImageBuffer } = require('../utils/cloudinary');
const { getPossibleMatches, calculateMatchQuality } = require('../utils/matcher');
const sendEmail = require('../utils/sendEmail');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const withImage = async (req) => {
  if (!req.file) return '';
  const url = await uploadImageBuffer(req.file.buffer);
  return url;
};

const reportLostItem = async (req, res, next) => {
  try {
    const imageUrl = await withImage(req);

    const payload = {
      ...req.body,
      user_id: req.user._id,
      image: imageUrl || req.body.image || '',
      status: 'open'
    };

    const lostItem = await LostItem.create(payload);

    const candidateFoundItems = await FoundItem.find({
      category: lostItem.category,
      status: { $ne: 'returned' }
    }).limit(200);

    const matches = getPossibleMatches(lostItem, candidateFoundItems);

    if (matches.length) {
      await LostItem.findByIdAndUpdate(lostItem._id, { status: 'matched' });
      
      // Create enhanced notification with match quality info
      const topMatches = matches.slice(0, 3);
      const matchQuality = calculateMatchQuality(matches[0].score);
      
      await Notification.create({
        user_id: req.user._id,
        title: 'Possible Match Found!',
        message: `We found ${matches.length} possible matches (${ matchQuality}) for your lost "${lostItem.item_name}". Check them out!`,
        item_type: 'lost',
        item_id: lostItem._id,
        match_count: matches.length,
        match_quality: matchQuality
      });

      if (payload.contact_email) {
        await sendEmail({
          to: payload.contact_email,
          subject: `GOD'S EYE: ${matches.length} Possible Match(es) Found`,
          text: `A possible match was found for your lost item: ${lostItem.item_name}. Open the app to view details!`
        });
      }

      logger.info('Lost item reported with matches', {
        itemId: lostItem._id,
        matchCount: matches.length,
        userId: req.user._id
      });
    }

    return sendSuccess(res, {
      item: lostItem,
      matches: matches.map(m => ({
        ...m.found.toObject(),
        matchScore: m.score,
        matchQuality: calculateMatchQuality(m.score),
        matchDetails: m.matchDetails
      }))
    }, matches.length > 0 ? 'Lost item reported! Possible matches found.' : 'Lost item reported successfully', 201);
  } catch (error) {
    logger.error('Error reporting lost item', { userId: req.user._id, error: error.message });
    return next(error);
  }
};

const reportFoundItem = async (req, res, next) => {
  try {
    const imageUrl = await withImage(req);

    const payload = {
      ...req.body,
      user_id: req.user._id,
      image: imageUrl || req.body.image || '',
      status: 'open'
    };

    const foundItem = await FoundItem.create(payload);

    const candidateLostItems = await LostItem.find({
      category: foundItem.category,
      status: { $ne: 'returned' }
    }).limit(200);

    const matches = getPossibleMatches(foundItem, candidateLostItems)
      .map(m => ({
        ...m.found.toObject(),
        matchScore: m.score,
        matchQuality: calculateMatchQuality(m.score),
        matchDetails: m.matchDetails
      }));

    if (matches.length) {
      await FoundItem.findByIdAndUpdate(foundItem._id, { status: 'matched' });
      
      // Notify potential owners about matches
      const topMatches = matches.slice(0, 3);
      for (const match of topMatches) {
        await Notification.create({
          user_id: match.user_id,
          title: 'Possible Match For Your Item!',
          message: `Someone reported finding an item that matches your lost "${match.item_name}". Quality: ${match.matchQuality}`,
          item_type: 'lost',
          item_id: match._id
        });

        if (match.contact_email) {
          await sendEmail({
            to: match.contact_email,
            subject: 'GOD\'S EYE: Possible Match Found for Your Lost Item',
            text: `Someone found an item matching your lost item: "${match.item_name}". Check the app for details!`
          });
        }
      }

      logger.info('Found item reported with matches', {
        itemId: foundItem._id,
        matchCount: matches.length,
        userId: req.user._id
      });
    }

    return sendSuccess(res, {
      item: foundItem,
      matches
    }, matches.length > 0 ? `Found item reported! ${matches.length} potential owner(s) notified.` : 'Found item reported successfully', 201);
  } catch (error) {
    logger.error('Error reporting found item', { userId: req.user._id, error: error.message });
    return next(error);
  }
};

const getLostItems = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      LostItem.find({ flagged_fake: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LostItem.countDocuments({ flagged_fake: { $ne: true } })
    ]);

    return sendPaginated(res, items, total, page, limit);
  } catch (error) {
    return next(error);
  }
};

const getFoundItems = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      FoundItem.find({ flagged_fake: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FoundItem.countDocuments({ flagged_fake: { $ne: true } })
    ]);

    return sendPaginated(res, items, total, page, limit);
  } catch (error) {
    return next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = (await LostItem.findById(id).populate('user_id', 'name email phone')) 
              || (await FoundItem.findById(id).populate('user_id', 'name email phone'));
    
    if (!item) return sendError(res, 'Item not found', 404);
    return sendSuccess(res, item, 'Item retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

const searchItems = async (req, res, next) => {
  try {
    const { item_name, category, location, date, page = 1, limit = 20 } = req.query;

    const buildRegex = (value) => (value ? { $regex: value, $options: 'i' } : null);

    const lostQuery = {
      flagged_fake: { $ne: true },
      status: { $ne: 'returned' },
      ...(item_name ? { item_name: buildRegex(item_name) } : {}),
      ...(category ? { category } : {}),
      ...(location ? { location_lost: buildRegex(location) } : {}),
      ...(date ? { date_lost: { $gte: new Date(date) } } : {})
    };

    const foundQuery = {
      flagged_fake: { $ne: true },
      status: { $ne: 'returned' },
      ...(item_name ? { item_name: buildRegex(item_name) } : {}),
      ...(category ? { category } : {}),
      ...(location ? { location_found: buildRegex(location) } : {}),
      ...(date ? { date_found: { $gte: new Date(date) } } : {})
    };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [lostItems, foundItems, lostCount, foundCount] = await Promise.all([
      LostItem.find(lostQuery).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      FoundItem.find(foundQuery).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      LostItem.countDocuments(lostQuery),
      FoundItem.countDocuments(foundQuery)
    ]);

    return sendSuccess(res, {
      lostItems: {
        items: lostItems,
        pagination: {
          total: lostCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(lostCount / limitNum)
        }
      },
      foundItems: {
        items: foundItems,
        pagination: {
          total: foundCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(foundCount / limitNum)
        }
      }
    }, 'Search results retrieved');
  } catch (error) {
    return next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    const Model = type === 'found' ? FoundItem : LostItem;
    const item = await Model.findById(id);

    if (!item) return sendError(res, 'Item not found', 404);
    if (item.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to update this item', 403);
    }

    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    return sendSuccess(res, updated, 'Item updated successfully');
  } catch (error) {
    return next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    const Model = type === 'found' ? FoundItem : LostItem;
    const item = await Model.findById(id);

    if (!item) return sendError(res, 'Item not found', 404);
    if (item.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to delete this item', 403);
    }

    await Model.findByIdAndDelete(id);
    logger.info('Item deleted', { itemId: id, userId: req.user._id });
    return sendSuccess(res, {}, 'Item deleted successfully');
  } catch (error) {
    return next(error);
  }
};

const myPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [lostItems, foundItems, lostCount, foundCount] = await Promise.all([
      LostItem.find({ user_id: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      FoundItem.find({ user_id: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      LostItem.countDocuments({ user_id: req.user._id }),
      FoundItem.countDocuments({ user_id: req.user._id })
    ]);

    return sendSuccess(res, {
      lostItems: { items: lostItems, count: lostCount },
      foundItems: { items: foundItems, count: foundCount }
    }, 'User posts retrieved');
  } catch (error) {
    return next(error);
  }
};

const markReturned = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    const Model = type === 'found' ? FoundItem : LostItem;
    const item = await Model.findById(id);

    if (!item) return sendError(res, 'Item not found', 404);
    if (item.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized', 403);
    }

    item.status = 'returned';
    await item.save();
    
    logger.info('Item marked as returned', { itemId: id, userId: req.user._id });
    return sendSuccess(res, item, 'Item marked as returned successfully');
  } catch (error) {
    return next(error);
  }
};

const reportFake = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    const Model = type === 'found' ? FoundItem : LostItem;
    const item = await Model.findById(id);

    if (!item) return sendError(res, 'Item not found', 404);

    item.flagged_fake = true;
    await item.save();

    logger.warn('Item flagged as fake', { itemId: id, reportedBy: req.user._id });
    return sendSuccess(res, {}, 'Listing has been reported and will be reviewed');
  } catch (error) {
    return next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ user_id: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user_id: req.user._id })
    ]);

    return sendPaginated(res, notifications, total, page, limit, 'Notifications retrieved');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  reportLostItem,
  reportFoundItem,
  getLostItems,
  getFoundItems,
  searchItems,
  getItemById,
  updateItem,
  deleteItem,
  myPosts,
  markReturned,
  reportFake,
  getNotifications
};
