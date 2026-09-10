import { body, validationResult } from 'express-validator';
import xss from 'xss';

// Middleware to evaluate validation rules and return 400 Bad Request if errors exist
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: Invalid or missing request parameters.',
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

// 1. Contact Form & Inquiry Validation Chain
export const validateContactInquiry = [
  body('name').trim().notEmpty().withMessage('Name is required.').escape(),
  body('email').trim().isEmail().withMessage('Valid email address is required.').normalizeEmail(),
  body('phone').optional().trim().escape(),
  body('message').optional().trim().escape(),
  body('inquiry_type').optional().trim().escape(),
  handleValidationErrors,
];

// 2. Admin Login Payload Validation Chain
export const validateLoginPayload = [
  body('password').notEmpty().withMessage('Password is required.').trim(),
  handleValidationErrors,
];

// 3. Product / Catalog Entry Validation Chain
export const validateProductPayload = [
  body('title').optional().trim().notEmpty().withMessage('Product title cannot be empty.').escape(),
  body('name').optional().trim().escape(),
  body('category_id').optional().isInt().withMessage('category_id must be an integer.'),
  body('brand_id').optional().isInt().withMessage('brand_id must be an integer.'),
  handleValidationErrors,
];

// 4. XSS Rich Text Sanitizer Helper
export const sanitizeHtml = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') return htmlContent;
  return xss(htmlContent, {
    whiteList: {
      p: [],
      b: [],
      i: [],
      strong: [],
      em: [],
      ul: ['class'],
      ol: ['class'],
      li: ['class'],
      br: [],
      span: ['class', 'style'],
      a: ['href', 'title', 'target', 'rel'],
      h1: ['class'],
      h2: ['class'],
      h3: ['class'],
      h4: ['class'],
      div: ['class'],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
};

export default {
  handleValidationErrors,
  validateContactInquiry,
  validateLoginPayload,
  validateProductPayload,
  sanitizeHtml,
};
