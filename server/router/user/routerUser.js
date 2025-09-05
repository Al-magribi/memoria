import express from "express";
import User from "../../models/UserSchema.js";
import { verify } from "../../middleware/verify.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/profiles");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}${extension}`;
    cb(null, filename);
  },
});

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/posts");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}${extension}`;
    cb(null, filename);
  },
});

const profileUpload = multer({ storage: profileStorage });
const postUpload = multer({ storage: postStorage });

const router = express.Router();

// ========================================
// AUTHENTICATION ROUTES
// ========================================

// Register new user
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
    } = req.body;

    console.log(req.body);

    // Check if user already exists
    const existingUser = await User.findByUsernameOrEmail(username);
    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post("/signin", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by username or email
    const user = await User.findByUsernameOrEmail(identifier);

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Update last seen
    await user.updateLastSeen();

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// PROFILE MANAGEMENT ROUTES
// ========================================

// Get user profile
router.get("/load-user", verify(), async (req, res) => {
  try {
    const { _id } = req.user;

    const user = await User.getUserWithPostCount(_id);
    if (!user) {
      console.log("User not found for ID:", _id);
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.log("Error loading user:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get other user's profile
router.get("/profile/:userId", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Don't allow users to view their own profile through this endpoint
    if (currentUserId.toString() === userId) {
      return res.status(400).json({
        message: "Use /load-user for your own profile",
      });
    }

    const user = await User.getPublicProfile(userId, currentUserId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if user is active and profile is visible
    if (!user.isActive) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check privacy settings
    if (user.privacy?.profileVisibility === "private") {
      return res.status(403).json({
        message: "This profile is private",
      });
    }

    res.json(user);
  } catch (error) {
    console.log("Error loading user profile:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update basic profile information - requires authentication
router.put("/profile/:userId", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      bio,
      title,
      dateOfBirth,
      gender,
      location,
      work,
      education,
      website,
      phone,
      username,
      email,
    } = req.body;

    // Check if user is updating their own profile
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "You can only update your own profile",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update fields
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (bio !== undefined) updateFields.bio = bio;
    if (title !== undefined) updateFields.title = title;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (gender) updateFields.gender = gender;
    if (location !== undefined) updateFields.location = location;
    if (work !== undefined) updateFields.work = work;
    if (education !== undefined) updateFields.education = education;
    if (website !== undefined) updateFields.website = website;
    if (phone !== undefined) updateFields.phone = phone;
    if (username !== undefined) updateFields.username = username;
    if (email !== undefined) updateFields.email = email;

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
});

// ========================================
// PRIVACY SETTINGS ROUTES
// ========================================

// Get privacy settings - requires authentication
router.get("/profile/:userId/privacy", verify(), async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is accessing their own privacy settings
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "You can only access your own privacy settings",
      });
    }

    const user = await User.findById(userId).select("privacy");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Privacy settings retrieved successfully",
      privacy: user.privacy,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving privacy settings",
      error: error.message,
    });
  }
});

// Update privacy settings - requires authentication
router.put("/profile/:userId/privacy", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      profileVisibility,
      showEmail,
      showPhone,
      showBirthday,
      allowFriendRequests,
      allowMessages,
    } = req.body;

    // Check if user is updating their own privacy settings
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "You can only update your own privacy settings",
      });
    }

    const updateFields = {};
    if (profileVisibility)
      updateFields["privacy.profileVisibility"] = profileVisibility;
    if (showEmail !== undefined) updateFields["privacy.showEmail"] = showEmail;
    if (showPhone !== undefined) updateFields["privacy.showPhone"] = showPhone;
    if (showBirthday !== undefined)
      updateFields["privacy.showBirthday"] = showBirthday;
    if (allowFriendRequests !== undefined)
      updateFields["privacy.allowFriendRequests"] = allowFriendRequests;
    if (allowMessages !== undefined)
      updateFields["privacy.allowMessages"] = allowMessages;

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Privacy settings updated successfully",
      privacy: updatedUser.privacy,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating privacy settings",
      error: error.message,
    });
  }
});

// ========================================
// FILE UPLOAD ROUTES
// ========================================

// Upload profile picture - requires authentication
router.post(
  "/profile/upload-picture",
  verify(),
  profileUpload.single("profilePicture"),
  async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          message: "User ID is required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      // Get current user to check for existing profile picture
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Delete old profile picture if it exists
      if (currentUser.profilePicture) {
        const oldFileName = currentUser.profilePicture.split("/").pop();
        const oldFilePath = path.join("./server/assets/profiles", oldFileName);

        // Do not delete if the file is 'user.jpg' or 'cover.jpg'
        if (fs.existsSync(oldFilePath) && oldFileName !== "user.jpg") {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update user's profile picture
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePicture: `/assets/profiles/${req.file.filename}` },
        { new: true }
      );

      res.json({
        message: "Profile picture uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({
        message: "Error uploading profile picture",
        error: error.message,
      });
    }
  }
);

// Upload cover photo - requires authentication
router.post(
  "/profile/upload-cover",
  verify(),
  profileUpload.single("coverPhoto"),
  async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          message: "User ID is required",
        });
      }

      // Check if user is uploading their own cover photo
      if (req.user._id.toString() !== userId) {
        return res.status(403).json({
          message: "You can only upload your own cover photo",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      // Get current user to check for existing cover photo
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Delete old cover photo if it exists
      if (currentUser.coverPhoto) {
        const oldFileName = currentUser.coverPhoto.split("/").pop();
        const oldFilePath = path.join("./server/assets/profiles", oldFileName);

        // Do not delete if the file is 'user.jpg' or 'cover.jpg'
        if (fs.existsSync(oldFilePath) && oldFileName !== "cover.jpg") {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update user's cover photo
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { coverPhoto: `/assets/profiles/${req.file.filename}` },
        { new: true }
      );

      res.json({
        message: "Cover photo uploaded successfully",
        coverPhoto: updatedUser.coverPhoto,
      });
    } catch (error) {
      console.error("Error uploading cover photo:", error);
      res.status(500).json({
        message: "Error uploading cover photo",
        error: error.message,
      });
    }
  }
);

// ========================================
// USER SEARCH AND DISCOVERY ROUTES
// ========================================

// Search users - requires authentication
router.get("/search", verify(), async (req, res) => {
  try {
    const { q, limit = 10, skip = 0, privacy = "public" } = req.query;

    if (!q) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const users = await User.searchUsers(q, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      privacy,
    });

    res.json({
      message: "Users found successfully",
      users,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        count: users.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching users",
      error: error.message,
    });
  }
});

// Get user statistics - requires authentication
router.get("/profile/:userId/stats", verify(), async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own stats or if profile is public
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get real-time statistics
    const realTimeStats = await User.calculateUserStats(userId);

    const stats = {
      ...user.stats,
      ...realTimeStats,
    };

    res.json({
      message: "User statistics retrieved successfully",
      stats,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving user statistics",
      error: error.message,
    });
  }
});

// Get user post count - requires authentication
router.get("/profile/:userId/post-count", verify(), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get real-time post count
    const Post = mongoose.model("Post");
    const postsCount = await Post.countDocuments({
      author: userId,
      isDeleted: false,
    });

    res.json({
      message: "Post count retrieved successfully",
      postsCount,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving post count",
      error: error.message,
    });
  }
});

// Update user statistics (for internal use) - requires authentication
router.put("/profile/:userId/stats", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const { field, increment = 1 } = req.body;

    // Check if user is updating their own stats
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "You can only update your own statistics",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.incrementStats(field, increment);

    res.json({
      message: "User statistics updated successfully",
      stats: user.stats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user statistics",
      error: error.message,
    });
  }
});

// ========================================
// ACCOUNT MANAGEMENT ROUTES
// ========================================

// Change password - requires authentication
router.put("/profile/:userId/password", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Check if user is changing their own password
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "You can only change your own password",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error changing password",
      error: error.message,
    });
  }
});

// Deactivate account - requires authentication
router.put("/profile/:userId/deactivate", verify(), async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is deactivating their own account
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "You can only deactivate your own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Account deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deactivating account",
      error: error.message,
    });
  }
});

// Reactivate account - requires authentication
router.put("/profile/:userId/reactivate", verify(), async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is reactivating their own account
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "You can only reactivate your own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Account reactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error reactivating account",
      error: error.message,
    });
  }
});

// Update last seen - requires authentication
router.put("/profile/:userId/last-seen", verify(), async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is updating their own last seen
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "You can only update your own last seen",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.updateLastSeen();

    res.json({
      message: "Last seen updated successfully",
      lastSeen: user.lastSeen,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating last seen",
      error: error.message,
    });
  }
});

// ========================================
// LOGOUT ROUTE
// ========================================

router.post("/logout", verify(), async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Endpoint untuk mengambil token dari cookie (untuk frontend/socket.io)
router.get("/token", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
