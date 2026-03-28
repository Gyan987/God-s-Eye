const express = require('express');
const { signup, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authValidation, validate } = require('../middleware/validate');

const router = express.Router();

router.post('/signup', authValidation, validate, signup);
router.post('/login', login);
router.get('/me', protect, me);

module.exports = router;
