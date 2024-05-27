import CommentModel from "../Models/commentModel.js";
import UserModel from "../Models/userModel.js";
import PostModel from "../Models/postModel.js";

export const getCommentsForPost = async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    if (req.headers.secretkey !== SECRET_KEY) {
        return res.status(500).send("unuthorized action");
    }

    const { postId } = req.params;

    try {
        const comments = await CommentModel.find({ postId });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCommentsForUser = async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    if (req.headers.secretkey !== SECRET_KEY) {
        return res.status(500).send("unuthorized action");
    }

    const { userId } = req.params;

    try {
        const comments = await CommentModel.find({ userId });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCommentById = async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    if (req.headers.secretkey !== SECRET_KEY) {
        return res.status(500).send("unuthorized action");
    }

    const id = req.params.id;

    try {
        const comment = await CommentModel.findById(id);
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addCommentOnPost = async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    if (req.headers.secretkey !== SECRET_KEY) {
        return res.status(500).send("unuthorized action");
    }

    const { userId, postId, comment } = req.body;

    try {
        // Check if the user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the post exists
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Create a new comment
        const newComment = new CommentModel({
            userId,
            postId,
            comment,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Save the new comment
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const UpdateCommentForPost = async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    if (req.headers.secretkey !== SECRET_KEY) {
        return res.status(500).send("unuthorized action");
    }

    const id = req.params.id;
    const { comment } = req.body;

    try {
        const updatedComment = await CommentModel.findByIdAndUpdate(
            id,
            { comment, updatedAt: new Date() },
            { new: true }
        );
        if (!updatedComment) {
            res.status(404).json({ message: "Comment not found" });
        } else {
            res.status(200).json(updatedComment);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCommentFromPost = async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    if (req.headers.secretkey !== SECRET_KEY) {
        return res.status(500).send("unuthorized action");
    }

    const id = req.params.id;

    try {
        const deletedComment = await CommentModel.findByIdAndDelete(id);
        if (!deletedComment) {
            res.status(404).json({ message: "Comment not found" });
        } else {
            res.status(200).json({ message: "Comment deleted successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const likeOrDisLikeComment = async (req, res) => {
    const SECRET_KEY = process.env.SECRET_KEY;
    if (req.headers.secretkey !== SECRET_KEY) {
        return res.status(500).send("unuthorized action");
    }

    const id = req.params.id;
    const { userId } = req.body;

    try {
        const comment = await CommentModel.findById(id);
        if (!comment.likes.includes(userId)) {
            await comment.updateOne({ $push: { likes: userId } });
            res.status(200).json("comment liked");
        } else {
            await comment.updateOne({ $pull: { likes: userId } });
            res.status(200).json("comment unliked");
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

