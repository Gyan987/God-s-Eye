const { validationResult, body } = require('express-validator');

const categories = ['phone', 'wallet', 'bag', 'documents', 'keys', 'pets', 'other'];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

const authValidation = [
  body('name').optional().isLength({ min: 2, max: 80 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6, max: 128 }),
  body('phone').optional().isLength({ min: 6, max: 20 }).trim()
];

const lostValidation = [
  body('item_name').isLength({ min: 2, max: 100 }).trim(),
  body('category').isIn(categories),
  body('description').isLength({ min: 5, max: 2000 }).trim(),
  body('location_lost').isLength({ min: 2, max: 200 }).trim(),
  body('date_lost').isISO8601(),
  body('contact_email').optional().isEmail().normalizeEmail(),
  body('contact_phone').optional().isLength({ min: 6, max: 20 }).trim(),
  body('reward').optional().isLength({ max: 120 }).trim()
];

const foundValidation = [
  body('item_name').isLength({ min: 2, max: 100 }).trim(),
  body('category').isIn(categories),
  body('description').isLength({ min: 5, max: 2000 }).trim(),
  body('location_found').isLength({ min: 2, max: 200 }).trim(),
  body('date_found').isISO8601(),
  body('finder_contact_email').optional().isEmail().normalizeEmail(),
  body('finder_phone').optional().isLength({ min: 6, max: 20 }).trim()
];

module.exports = {
  validate,
  authValidation,
  lostValidation,
  foundValidation
};
