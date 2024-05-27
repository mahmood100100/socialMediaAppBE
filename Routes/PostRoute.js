import express from "express";
import { createPost, deletePost, getPost, getTimelinePosts, likePost, updatePost } from "../Controllers/PostController.js";
import upload from '../uploadMiddleware.js';

const router = express.Router();

router.post('/',upload.single("postPicture") , createPost);
router.get('/:id', getPost);
router.put('/:id', upload.single("postPicture") , updatePost);
router.delete("/:id", deletePost);
router.put("/:id/like", likePost);
router.get("/:id/timeline", getTimelinePosts);

export default router;
