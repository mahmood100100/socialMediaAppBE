import express from 'express';
import { loginUser, registerUser } from '../Controllers/AuthController.js';
import upload from '../uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('profileImage'), registerUser);
router.post('/login', loginUser);

export default router;
