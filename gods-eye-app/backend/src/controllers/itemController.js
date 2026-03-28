const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification');
const { uploadImageBuffer } = require('../utils/cloudinary');
const { getPossibleMatches } = require('../utils/matcher');
const sendEmail = require('../utils/sendEmail');

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
      await Notification.create({
        user_id: req.user._id,
        title: 'Possible Match Found',
        message: `We found ${matches.length} possible matches for ${lostItem.item_name}.`,
        item_type: 'lost',
        item_id: lostItem._id
      });

      if (payload.contact_email) {
        await sendEmail({
          to: payload.contact_email,
          subject: 'GOD\'S EYE: Possible Match Found',
          text: `A possible match was found for your lost item: ${lostItem.item_name}.`
        });
      }
    }

    return res.status(201).json({
      message: matches.length ? 'Possible Match Found' : 'Lost item reported successfully',
      item: lostItem,
      matches
    });
  } catch (error) {
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

    const matches = candidateLostItems
      .map((lost) => ({
        found: lost,
        score:
          lost.category === foundItem.category &&
          new Date(foundItem.date_found).toDateString() === new Date(lost.date_lost).toDateString()
            ? 60
            : 45
      }))
      .slice(0, 5);

    if (matches.length) {
      await FoundItem.findByIdAndUpdate(foundItem._id, { status: 'matched' });
      const firstOwner = matches[0]?.found;
      if (firstOwner?.contact_email) {
        await sendEmail({
          to: firstOwner.contact_email,
          subject: 'GOD\'S EYE: Possible Match Found',
          text: `Someone reported a found item that may match your listing: ${firstOwner.item_name}.`
        });
      }
    }

    return res.status(201).json({
      message: matches.length ? 'Possible Match Found' : 'Found item reported successfully',
      item: foundItem,
      matches
    });
  } catch (error) {
    return next(error);
  }
};

const getLostItems = async (req, res, next) => {
  try {
    const items = await LostItem.find().sort({ createdAt: -1 }).limit(200);
    return res.json(items);
  } catch (error) {
    return next(error);
  }
};

const getFoundItems = async (req, res, next) => {
  try {
    const items = await FoundItem.find().sort({ createdAt: -1 }).limit(200);
    return res.json(items);
  } catch (error) {
    return next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = (await LostItem.findById(id)) || (await FoundItem.findById(id));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    return res.json(item);
  } catch (error) {
    return next(error);
  }
};

const searchItems = async (req, res, next) => {
  try {
    const { item_name, category, location, date } = req.query;

    const buildRegex = (value) => (value ? { $regex: value, $options: 'i' } : null);

    const lostQuery = {
      ...(item_name ? { item_name: buildRegex(item_name) } : {}),
      ...(category ? { category } : {}),
      ...(location ? { location_lost: buildRegex(location) } : {}),
      ...(date ? { date_lost: { $gte: new Date(date) } } : {})
    };

    const foundQuery = {
      ...(item_name ? { item_name: buildRegex(item_name) } : {}),
      ...(category ? { category } : {}),
      ...(location ? { location_found: buildRegex(location) } : {}),
      ...(date ? { date_found: { $gte: new Date(date) } } : {})
    };

    const [lostItems, foundItems] = await Promise.all([
      LostItem.find(lostQuery).limit(100),
      FoundItem.find(foundQuery).limit(100)
    ]);

    return res.json({ lostItems, foundItems });
  } catch (error) {
    return next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    const Model = type === 'found' ? FoundItem : LostItem;
    const item = await Model.findById(id);

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ message: 'Item updated', item: updated });
  } catch (error) {
    return next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    const Model = type === 'found' ? FoundItem : LostItem;
    const item = await Model.findById(id);

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await Model.findByIdAndDelete(id);
    return res.json({ message: 'Item deleted' });
  } catch (error) {
    return next(error);
  }
};

const myPosts = async (req, res, next) => {
  try {
    const [lostItems, foundItems] = await Promise.all([
      LostItem.find({ user_id: req.user._id }).sort({ createdAt: -1 }),
      FoundItem.find({ user_id: req.user._id }).sort({ createdAt: -1 })
    ]);

    return res.json({ lostItems, foundItems });
  } catch (error) {
    return next(error);
  }
};

const markReturned = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    const Model = type === 'found' ? FoundItem : LostItem;
    const item = await Model.findById(id);

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    item.status = 'returned';
    await item.save();

    return res.json({ message: 'Item marked as returned', item });
  } catch (error) {
    return next(error);
  }
};

const reportFake = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    const Model = type === 'found' ? FoundItem : LostItem;
    const item = await Model.findById(id);

    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.flagged_fake = true;
    await item.save();

    return res.json({ message: 'Listing reported for review' });
  } catch (error) {
    return next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    return res.json(notifications);
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
