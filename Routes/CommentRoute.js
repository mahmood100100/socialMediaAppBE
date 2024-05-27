import express from 'express';
import {likeOrDisLikeComment, addCommentOnPost , deleteCommentFromPost , UpdateCommentForPost , getCommentById , getCommentsForUser , getCommentsForPost } from '../Controllers/CommentController.js';

const router = express.Router();

router.post('/', addCommentOnPost );
router.get('/post/:postId', getCommentsForPost );
router.get('/user/:userId', getCommentsForUser );
router.get('/:id' , getCommentById);
router.put('/:id' , UpdateCommentForPost);
router.delete('/:id' , deleteCommentFromPost);
router.put('/:id/like' , likeOrDisLikeComment);

export default router;
