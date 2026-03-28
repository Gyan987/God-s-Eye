const express = require('express');
const { dashboard, listUsers, banUser, deletePost } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.put('/ban-user/:userId', banUser);
router.delete('/delete-post', deletePost);

module.exports = router;
