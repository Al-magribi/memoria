import express from "express";
import Friendship from "../../models/FriendshipSchema.js";
import Notification from "../../models/NotificationSchema.js";
import User from "../../models/UserSchema.js";
import { verify } from "../../middleware/verify.js";

const router = express.Router();

// ========================================
// FRIEND REQUEST ROUTES
// ========================================

// Send friend request
router.post("/request", verify(), async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!recipient.privacy.allowFriendRequests) {
      return res
        .status(403)
        .json({ message: "This user does not accept friend requests" });
    }

    const existingFriendship = await Friendship.findFriendship(
      requesterId,
      recipientId
    );
    if (existingFriendship) {
      if (existingFriendship.status === "pending") {
        return res.status(400).json({ message: "Friend request already sent" });
      } else if (existingFriendship.status === "accepted") {
        return res.status(400).json({ message: "You are already friends" });
      }
    }

    const friendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
    });

    await friendship.save();
    await Notification.createFriendRequestNotification(
      requesterId,
      recipientId
    );

    res.status(201).json({
      message: "Friend request sent successfully",
      friendship: { id: friendship._id, status: friendship.status },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending friend request", error: error.message });
  }
});

// Accept friend request
router.put("/accept/:friendshipId", verify(), async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user._id;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendship.recipient.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only accept friend requests sent to you" });
    }

    if (friendship.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Friend request is no longer pending" });
    }

    await friendship.accept();
    await Notification.createFriendAcceptedNotification(
      userId,
      friendship.requester
    );

    res.json({
      message: "Friend request accepted successfully",
      friendship: { id: friendship._id, status: friendship.status },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting friend request",
      error: error.message,
    });
  }
});

// Reject friend request
router.put("/reject/:friendshipId", verify(), async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user._id;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendship.recipient.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only reject friend requests sent to you" });
    }

    if (friendship.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Friend request is no longer pending" });
    }

    await friendship.reject();

    res.json({
      message: "Friend request rejected successfully",
      friendship: { id: friendship._id, status: friendship.status },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error rejecting friend request",
      error: error.message,
    });
  }
});

// Cancel friend request (by requester)
router.delete("/cancel/:friendshipId", verify(), async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user._id;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    // Check if user is the requester
    if (friendship.requester.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only cancel friend requests you sent",
      });
    }

    // Check if request is still pending
    if (friendship.status !== "pending") {
      return res.status(400).json({
        message: "Friend request is no longer pending",
      });
    }

    // Delete the friendship
    await Friendship.findByIdAndDelete(friendshipId);

    res.json({
      message: "Friend request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    res.status(500).json({
      message: "Error cancelling friend request",
      error: error.message,
    });
  }
});

// ========================================
// FRIENDS LIST ROUTES
// ========================================

// Get friend requests
router.get("/requests", verify(), async (req, res) => {
  try {
    const userId = req.user._id;
    const friendRequests = await Friendship.getFriendRequests(userId);

    const requestsWithMutual = await Promise.all(
      friendRequests.map(async (friendship) => {
        const mutualCount = await Friendship.calculateMutualFriendsCount(
          friendship.requester._id,
          userId
        );

        return {
          id: friendship._id,
          requester: friendship.requester,
          mutualFriendsCount: mutualCount,
          requestedAt: friendship.requestedAt,
        };
      })
    );

    res.json({
      message: "Friend requests retrieved successfully",
      requests: requestsWithMutual,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting friend requests", error: error.message });
  }
});

// Get friends list
router.get("/friends", verify(), async (req, res) => {
  try {
    const userId = req.user._id;
    const friendships = await Friendship.getFriends(userId);

    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friend =
          friendship.requester._id.toString() === userId.toString()
            ? friendship.recipient
            : friendship.requester;

        // Calculate mutual friends count in real-time
        const mutualCount = await Friendship.calculateMutualFriendsCount(
          userId,
          friend._id
        );

        return {
          id: friend._id,
          firstName: friend.firstName,
          lastName: friend.lastName,
          username: friend.username,
          profilePicture: friend.profilePicture,
          bio: friend.bio,
          lastSeen: friend.lastSeen,
          mutualFriendsCount: mutualCount,
          friendshipId: friendship._id,
        };
      })
    );

    res.json({
      message: "Friends list retrieved successfully",
      friends,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting friends list", error: error.message });
  }
});

// Get mutual friends
router.get("/mutual/:userId", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const mutualFriends = await Friendship.getMutualFriends(
      currentUserId,
      userId
    );

    res.json({
      message: "Mutual friends retrieved successfully",
      mutualFriends,
      count: mutualFriends.length,
    });
  } catch (error) {
    console.error("Error getting mutual friends:", error);
    res.status(500).json({
      message: "Error getting mutual friends",
      error: error.message,
    });
  }
});

// Get friendship suggestions
router.get("/suggestions", verify(), async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const suggestions = await Friendship.getSuggestions(currentUserId);

    res.json({
      message: "Friendship suggestions retrieved successfully",
      suggestions,
    });
  } catch (error) {
    console.error("Error getting friendship suggestions:", error);
    res.status(500).json({ message: error.message });
  }
});

// ========================================
// FRIENDSHIP STATUS ROUTES
// ========================================

// Get friendship status
router.get("/status/:userId", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const friendship = await Friendship.findFriendship(currentUserId, userId);

    if (!friendship) {
      return res.json({
        status: "none",
        canSendRequest: true,
      });
    }

    let canSendRequest = false;
    if (friendship.status === "rejected" || friendship.status === "blocked") {
      canSendRequest = false;
    } else if (friendship.status === "pending") {
      canSendRequest =
        friendship.requester.toString() === currentUserId.toString()
          ? false
          : true;
    }

    res.json({
      status: friendship.status,
      friendshipId: friendship._id,
      canSendRequest,
      mutualFriendsCount: friendship.mutualFriendsCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error getting friendship status",
      error: error.message,
    });
  }
});

// Unfriend user
router.delete("/unfriend/:friendshipId", verify(), async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user._id;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({
        message: "Friendship not found",
      });
    }

    // Check if user is part of the friendship
    if (
      friendship.requester.toString() !== userId.toString() &&
      friendship.recipient.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "You can only unfriend users you are friends with",
      });
    }

    // Check if friendship is accepted
    if (friendship.status !== "accepted") {
      return res.status(400).json({
        message: "You can only unfriend accepted friends",
      });
    }

    // Update user stats
    const requester = await User.findById(friendship.requester);
    const recipient = await User.findById(friendship.recipient);

    if (requester) {
      await requester.decrementStats("friendsCount");
    }
    if (recipient) {
      await recipient.decrementStats("friendsCount");
    }

    // Delete the friendship
    await Friendship.findByIdAndDelete(friendshipId);

    res.json({
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("Error unfriending user:", error);
    res.status(500).json({
      message: "Error unfriending user",
      error: error.message,
    });
  }
});

// Block user
router.put("/block/:userId", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Check if user exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find or create friendship
    let friendship = await Friendship.findFriendship(currentUserId, userId);

    if (!friendship) {
      friendship = new Friendship({
        requester: currentUserId,
        recipient: userId,
      });
    }

    // Block the user
    await friendship.block(currentUserId);

    res.json({
      message: "User blocked successfully",
      friendship: {
        id: friendship._id,
        status: friendship.status,
        blockedAt: friendship.blockedAt,
      },
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({
      message: "Error blocking user",
      error: error.message,
    });
  }
});

// Unblock user
router.put("/unblock/:userId", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const friendship = await Friendship.findFriendship(currentUserId, userId);
    if (!friendship) {
      return res.status(404).json({
        message: "Friendship not found",
      });
    }

    // Check if user is blocked
    if (friendship.status !== "blocked") {
      return res.status(400).json({
        message: "User is not blocked",
      });
    }

    // Check if current user is the one who blocked
    if (friendship.blockedBy.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        message: "You can only unblock users you blocked",
      });
    }

    // Delete the friendship (unblock)
    await Friendship.findByIdAndDelete(friendship._id);

    res.json({
      message: "User unblocked successfully",
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({
      message: "Error unblocking user",
      error: error.message,
    });
  }
});

export default router;
