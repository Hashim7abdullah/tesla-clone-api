// routes/authRoutes.js
import express from 'express';
import {login , logout , register ,refreshAccessToken} from '../controller/userController.js';
import { authMiddleware, authorizeRoles } from '../Middleware/AuthMiddleware.js';

const router = express.Router();

router.post('/signin', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout',  logout);

// Protected route example
router.get('/protected', 
  authMiddleware, 
  authorizeRoles('admin', 'user'), 
  (req, res) => {
    res.json({ 
      success: true, 
      message: 'Access granted',
      user: req.user 
    });
  }
);

export default router;