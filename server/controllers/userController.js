import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

// ===============================
// Controller: Sign up new user
// ===============================
export const signUp = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    // Check for missing fields
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "Account exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    // Generate auth token
    const token = generateToken(newUser._id);

    // Respond with user data and token
    res.json({
      success: true,
      userData: newUser,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

// ===============================
// Controller: Login existing user
// ===============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Generate token and return user
    const token = generateToken(userData._id);
    res.json({ success: true, userData, token, message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ===============================
// Controller: Check authentication
// ===============================
export const checkAuth = (req, res) => {
  // `req.user` is assumed to be set by middleware after token verification
  res.json({ success: true, user: req.user });
};

// ===============================
// Controller: Update profile
// ===============================
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updatedUser;

    // Update user without image
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      // Upload new profile picture to Cloudinary
      const upload = await cloudinary.uploader.upload(profilePic);

      // Update user with image URL
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          profilePic: upload.secure_url,
          bio,
          fullName,
        },
        { new: true }
      );
    }

    // Return updated user
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
