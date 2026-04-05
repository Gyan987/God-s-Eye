const { validationResult, body } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

const categories = ['phone', 'wallet', 'bag', 'documents', 'keys', 'pets', 'other'];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg || `Invalid value for ${err.param}`,
      value: err.value
    }));
    return sendError(res, 'Validation failed', 400, formattedErrors);
  }
  return next();
};

const authValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Phone must be between 6 and 20 characters')
];

const lostValidation = [
  body('item_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  body('category')
    .isIn(categories)
    .withMessage(`Category must be one of: ${categories.join(', ')}`),
  body('description')
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Description must be between 5 and 2000 characters'),
  body('location_lost')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('date_lost')
    .isISO8601()
    .withMessage('Date must be in valid ISO 8601 format')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date lost cannot be in the future');
      }
      return true;
    }),
  body('contact_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('contact_phone')
    .optional()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Phone must be between 6 and 20 characters'),
  body('reward')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Reward description must be under 120 characters')
];

const foundValidation = [
  body('item_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  body('category')
    .isIn(categories)
    .withMessage(`Category must be one of: ${categories.join(', ')}`),
  body('description')
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Description must be between 5 and 2000 characters'),
  body('location_found')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('date_found')
    .isISO8601()
    .withMessage('Date must be in valid ISO 8601 format')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date found cannot be in the future');
      }
      return true;
    }),
  body('finder_contact_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('finder_phone')
    .optional()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Phone must be between 6 and 20 characters')
];

module.exports = {
  validate,
  authValidation,
  lostValidation,
  foundValidation
};
