import express from "express";
import mongoose from "mongoose";
import Notification from "../../models/NotificationSchema.js";
import { verify } from "../../middleware/verify.js";

const router = express.Router();

// Get notifications
router.get("/", verify(), async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.getNotifications(
      userId,
      parseInt(page),
      parseInt(limit)
    );
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      message: "Notifications retrieved successfully",
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error getting notifications",
      error: error.message,
    });
  }
});

// Mark notification as read
router.put("/:notificationId/read", verify(), async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only mark your own notifications as read",
      });
    }

    await notification.markAsRead();

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
    });
  }
});

// Mark all notifications as read
router.put("/read-all", verify(), async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.markAllAsRead(userId);

    res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking notifications as read",
      error: error.message,
    });
  }
});

// Get unread count
router.get("/unread-count", verify(), async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      message: "Unread count retrieved successfully",
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error getting unread count",
      error: error.message,
    });
  }
});

// Create test notifications (for development only)
router.post("/test", verify(), async (req, res) => {
  try {
    const userId = req.user._id;
    const User = mongoose.model("User");

    // Get a random user as sender (not the current user)
    const randomUser = await User.findOne({ _id: { $ne: userId } });
    if (!randomUser) {
      return res.status(400).json({
        message: "No other users found to create test notifications",
      });
    }

    const testNotifications = [
      {
        recipient: userId,
        sender: randomUser._id,
        type: "friend_request",
        title: "Friend Request",
        body: `${randomUser.firstName} ${randomUser.lastName} sent you a friend request`,
        image: randomUser.profilePicture,
        isRead: false,
      },
      {
        recipient: userId,
        sender: randomUser._id,
        type: "post_like",
        title: "Post Liked",
        body: `${randomUser.firstName} ${randomUser.lastName} liked your post`,
        image: randomUser.profilePicture,
        isRead: false,
      },
      {
        recipient: userId,
        sender: randomUser._id,
        type: "post_comment",
        title: "New Comment",
        body: `${randomUser.firstName} ${randomUser.lastName} commented on your post`,
        image: randomUser.profilePicture,
        isRead: true,
      },
      {
        recipient: userId,
        sender: randomUser._id,
        type: "message",
        title: "New Message",
        body: `${randomUser.firstName} ${randomUser.lastName} sent you a message`,
        image: randomUser.profilePicture,
        isRead: false,
      },
    ];

    const createdNotifications = await Notification.insertMany(
      testNotifications
    );

    res.json({
      message: "Test notifications created successfully",
      count: createdNotifications.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating test notifications",
      error: error.message,
    });
  }
});

export default router;
