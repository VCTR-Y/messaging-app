import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  // res.send("Sign up page");
  const { fullName, email, password } = req.body;
  try {

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      });
    } else {
      return res.status(400).json({
        message: "User not created",
      });
    }

  } catch (error) {
    console.log("Error in signup: ", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  // res.send("Login page");
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
    });

  } catch (error) {
    console.log("Error in login: ", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};   

export const logout = (req, res) => {
  // res.send("Logout page");
  try {
    res.cookie("jwt", "", {maxAge: 0});
    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    console.log("Error in logout: ", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}; 

export const updateProfile = async (req, res) => {
  // res.send("Update profile page");
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({
        message: "Please provide a profile picture",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    const updatedUser = await User.findByIdAndUpdate(userId, {profilePicture: uploadResponse.secure_url}, {new: true});

    res.status(200).json(updatedUser);
    
  } catch (error) {
    console.log("Error in update profile: ", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in check auth: ", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}