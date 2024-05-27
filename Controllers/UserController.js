import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import { uploadImageToFirebase } from "../SharedFunctions.js";
import { deleteImageFromFirebase } from "../SharedFunctions.js";

// get a User
export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await UserModel.findById(id);

    if (user) {
      const { password, ...otherDetails } = user._doc;

      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("No such user exists");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Update a user
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, password, firstname, lastname } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    user.username = username || user.username;
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    // Check if profilePicture URL is provided in the request body
    if (user.profilePicture && req.files.profilePicture) {
      // Delete previous profile picture from Firebase if exists
      await deleteImageFromFirebase(user.profilePicture);
    }

    // Check if coverPicture URL is provided in the request body
    if (user.coverPicture && req.files.coverPicture) {
      // Delete previous cover picture from Firebase if exists
      await deleteImageFromFirebase(user.coverPicture);
    }

    // Check if profile image is provided

    if (req.files && req.files.profilePicture) {
      const profileImage = req.files.profilePicture[0]; // Get the first file uploaded
      // Upload profile image to Firebase Storage and update user's profile image field
      const profileImageUrl = await uploadImageToFirebase('users' ,userId , 'profile' , profileImage,);
      user.profilePicture = profileImageUrl;
    }

    // Check if cover image is provided
    if (req.files && req.files.coverPicture) {
      const coverImage = req.files.coverPicture[0]; // Get the first file uploaded
      // Upload cover image to Firebase Storage and update user's cover image field
      const coverImageUrl = await uploadImageToFirebase('users',userId , 'cover' , coverImage);
      user.coverPicture = coverImageUrl;
    }

    // Save the updated user to the database
    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete a user
export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the  pictures from Firebase if it exists
    if (user.profilePicture) {
      await deleteImageFromFirebase(user.profilePicture);
    }
    if(user.coverPicture) {
      await deleteImageFromFirebase(user.coverPicture);
    }

    // Delete the user from the database
    await UserModel.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Follow a User
export const followUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json("Action forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (!followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $push: { followers: currentUserId } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("User followed!");
      } else {
        res.status(403).json("User is Already followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// UnFollow a User
export const UnFollowUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json("Action forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $pull: { followers: currentUserId } });
        await followingUser.updateOne({ $pull: { following: id } });
        res.status(200).json("User Unfollowed!");
      } else {
        res.status(403).json("User is not followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};
