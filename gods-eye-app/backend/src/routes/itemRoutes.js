const express = require('express');
const {
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
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { lostValidation, foundValidation, validate } = require('../middleware/validate');

const router = express.Router();

router.post('/lost-items', protect, upload.single('image'), lostValidation, validate, reportLostItem);
router.post('/found-items', protect, upload.single('image'), foundValidation, validate, reportFoundItem);
router.get('/lost-items', getLostItems);
router.get('/found-items', getFoundItems);
router.get('/search', searchItems);
router.get('/items/:id', getItemById);
router.put('/update-item', protect, updateItem);
router.delete('/delete-item', protect, deleteItem);
router.get('/my-posts', protect, myPosts);
router.put('/mark-returned', protect, markReturned);
router.post('/report-fake', protect, reportFake);
router.get('/notifications', protect, getNotifications);

module.exports = router;
