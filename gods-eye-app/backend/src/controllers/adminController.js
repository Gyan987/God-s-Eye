const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

const dashboard = async (req, res, next) => {
  try {
    const [users, lostItems, foundItems, flaggedLost, flaggedFound] = await Promise.all([
      User.countDocuments(),
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      LostItem.countDocuments({ flagged_fake: true }),
      FoundItem.countDocuments({ flagged_fake: true })
    ]);

    return res.json({ users, lostItems, foundItems, flagged: flaggedLost + flaggedFound });
  } catch (error) {
    return next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { banned: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User banned', user });
  } catch (error) {
    return next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id, type } = req.body;
    const Model = type === 'found' ? FoundItem : LostItem;
    await Model.findByIdAndDelete(id);
    return res.json({ message: 'Post deleted by admin' });
  } catch (error) {
    return next(error);
  }
};

module.exports = { dashboard, listUsers, banUser, deletePost };
