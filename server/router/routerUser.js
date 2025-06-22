import express from "express";
import User from "../model/userModel.js";

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
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
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
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
});

// ========================================
// PROFILE MANAGEMENT ROUTES
// ========================================

// Get user profile
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.query.requestingUserId; // For privacy checks

    const user = await User.getPublicProfile(userId, requestingUserId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving profile",
      error: error.message,
    });
  }
});

// Update basic profile information
router.put("/profile/:userId", async (req, res) => {
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
    } = req.body;

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

// Update profile pictures
router.put("/profile/:userId/pictures", async (req, res) => {
  try {
    const { userId } = req.params;
    const { profilePicture, coverPhoto } = req.body;

    const updateFields = {};
    if (profilePicture !== undefined)
      updateFields.profilePicture = profilePicture;
    if (coverPhoto !== undefined) updateFields.coverPhoto = coverPhoto;

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile pictures updated successfully",
      user: {
        id: updatedUser._id,
        profilePicture: updatedUser.profilePicture,
        coverPhoto: updatedUser.coverPhoto,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile pictures",
      error: error.message,
    });
  }
});

// ========================================
// PRIVACY SETTINGS ROUTES
// ========================================

// Get privacy settings
router.get("/profile/:userId/privacy", async (req, res) => {
  try {
    const { userId } = req.params;

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

// Update privacy settings
router.put("/profile/:userId/privacy", async (req, res) => {
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
// NOTIFICATION SETTINGS ROUTES
// ========================================

// Get notification settings
router.get("/profile/:userId/notifications", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("notifications");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Notification settings retrieved successfully",
      notifications: user.notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving notification settings",
      error: error.message,
    });
  }
});

// Update notification settings
router.put("/profile/:userId/notifications", async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, push, sms, friendRequests, messages, likes, comments } =
      req.body;

    const updateFields = {};
    if (email !== undefined) updateFields["notifications.email"] = email;
    if (push !== undefined) updateFields["notifications.push"] = push;
    if (sms !== undefined) updateFields["notifications.sms"] = sms;
    if (friendRequests !== undefined)
      updateFields["notifications.friendRequests"] = friendRequests;
    if (messages !== undefined)
      updateFields["notifications.messages"] = messages;
    if (likes !== undefined) updateFields["notifications.likes"] = likes;
    if (comments !== undefined)
      updateFields["notifications.comments"] = comments;

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Notification settings updated successfully",
      notifications: updatedUser.notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating notification settings",
      error: error.message,
    });
  }
});

// ========================================
// USER SEARCH AND DISCOVERY ROUTES
// ========================================

// Search users
router.get("/search", async (req, res) => {
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

// Get user statistics
router.get("/profile/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "stats username firstName lastName"
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User statistics retrieved successfully",
      stats: user.stats,
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

// Update user statistics (for internal use)
router.put("/profile/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;
    const { field, increment = 1 } = req.body;

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

// Change password
router.put("/profile/:userId/password", async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

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

// Deactivate account
router.put("/profile/:userId/deactivate", async (req, res) => {
  try {
    const { userId } = req.params;

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

// Reactivate account
router.put("/profile/:userId/reactivate", async (req, res) => {
  try {
    const { userId } = req.params;

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

// Update last seen
router.put("/profile/:userId/last-seen", async (req, res) => {
  try {
    const { userId } = req.params;

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

export default router;
