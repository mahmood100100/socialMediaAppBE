import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadImageToFirebase } from "../SharedFunctions.js";

// Registering a new User
export const registerUser = async (req, res) => {
  const { username, password, firstname, lastname } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance
    const newUser = new UserModel({
      username,
      password: hashedPassword,
      firstname,
      lastname,
    });

    // Upload profile picture to Firebase if provided
    if (req.file) {
      try {
        const profileImageUrl = await uploadImageToFirebase('users', newUser._id, 'profile', req.file);
        newUser.profilePicture = profileImageUrl;
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }

    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET);

    res.status(200).json({ message: "Login successful", token , userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
