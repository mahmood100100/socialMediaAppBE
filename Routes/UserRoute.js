import express from "express";
import { deleteUser, followUser, getUser, UnFollowUser, updateUser } from "../Controllers/UserController.js";
import upload from '../uploadMiddleware.js';

const router = express.Router();

router.get('/:id', getUser); 
router.put('/:id', upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'coverPicture', maxCount: 1 }]), updateUser);
router.delete('/:id', deleteUser); 
router.put('/:id/follow', followUser); 
router.put('/:id/unfollow', UnFollowUser); 

export default router; 