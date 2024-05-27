import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/userModel.js";
import { uploadImageToFirebase } from "../SharedFunctions.js";
import { deleteImageFromFirebase } from "../SharedFunctions.js";
// Create new Post
export const createPost = async (req, res) => {
  const { title, content, userId } = req.body;

  try {
    // Check if userId exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new post instance
    const newPost = new PostModel({
      title,
      content,
      userId,
    });

    // Upload post image to Firebase if provided
    if (req.file) {
      try {
        const postImageUrl = await uploadImageToFirebase('posts', newPost._id, 'post', req.file);
        newPost.image = postImageUrl;
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }

    // Save the new post to the database
    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a post
export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Update a post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      // If a new image is provided
      if (req.file) {
        // Delete the old image from Firebase if it exists
        if (post.image) {
          try {
            await deleteImageFromFirebase(post.image);
          } catch (error) {
            return res.status(500).json({ message: "Failed to delete old image from Firebase" });
          }
        }

        // Upload the new image to Firebase
        try {
          const newImageUrl = await uploadImageToFirebase('posts', postId, 'post', req.file);
          req.body.image = newImageUrl; // Add the new image URL to the update request body
        } catch (error) {
          return res.status(500).json({ message: "Failed to upload new image to Firebase" });
        }
      }

      // Update the post with the new data
      await post.updateOne({ $set: req.body });
      const updatedPost = await PostModel.findById(postId);
      res.status(200).json(updatedPost);
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      // Delete the post image from Firebase if it exists
      if (post.image) {
        try {
          await deleteImageFromFirebase(post.image);
        } catch (error) {
          return res.status(500).json({ message: "Failed to delete image from Firebase" });
        }
      }

      await post.deleteOne();
      res.status(200).json("Post deleted successfully");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// like/dislike a post
export const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post liked");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get Timeline Posts
export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const currentUserPosts = await PostModel.find({ userId: userId });
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);

    res
      .status(200)
      .json(currentUserPosts.concat(...followingPosts[0].followingPosts)
      .sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    res.status(500).json(error);
  }
};