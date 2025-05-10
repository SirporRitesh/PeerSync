import { body, validationResult } from 'express-validator';

export const validateSignup = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('workspaceName').if(body('inviteCode').not().exists())
    .notEmpty().withMessage('Workspace name is required when creating a workspace'),
  body('inviteCode').if(body('workspaceName').not().exists())
    .notEmpty().withMessage('Invite code is required when joining a workspace'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }
    next();
  }
];