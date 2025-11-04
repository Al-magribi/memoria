import { Router } from "express";
import { verify } from "../middlewares/Verify.js";
import User from "../schema/UserSchema.js";

const router = Router();

// Get all users except the current user
router.get("/get-users", verify(), async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "firstName lastName username avatar"
    );
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all friends of the current user
router.get("/get-my-friends", verify(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "firstName lastName username avatar"
    );
    res.json(user.friends);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all friend requests for the current user
router.get("/get-friend-requests", verify(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friendRequests",
      "firstName lastName username avatar"
    );
    res.json(user.friendRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Send a friend request to a user
router.post("/add-friend/:friendId", verify(), async (req, res) => {
  try {
    const { friendId } = req.params;
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (friend.friendRequests.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Friend request already sent" });
    }

    if (friend.friends.includes(req.user._id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    friend.friendRequests.push(req.user._id);
    await friend.save();

    res.json({ message: "Friend request sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Accept a friend request
router.post("/accept-friend/:friendId", verify(), async (req, res) => {
  try {
    const { friendId } = req.params;
    const user = await User.findById(req.user._id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.friendRequests.includes(friendId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== friendId
    );
    user.friends.push(friendId);

    friend.friends.push(req.user._id);

    await user.save();
    await friend.save();

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Reject a friend request
router.post("/reject-friend/:friendId", verify(), async (req, res) => {
  try {
    const { friendId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user.friendRequests.includes(friendId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== friendId
    );
    await user.save();

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel a friend request sent by the current user
router.post("/cancel-request/:friendId", verify(), async (req, res) => {
    try {
      const { friendId } = req.params;
      const friend = await User.findById(friendId);
  
      if (!friend) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (!friend.friendRequests.includes(req.user._id)) {
        return res.status(400).json({ message: "No friend request sent to this user" });
      }
  
      friend.friendRequests = friend.friendRequests.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      await friend.save();
  
      res.json({ message: "Friend request cancelled" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

// Remove a friend
router.put("/remove-friend/:friendId", verify(), async (req, res) => {
  try {
    const { friendId } = req.params;
    const user = await User.findById(req.user._id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Not friends with this user" });
    }

    user.friends = user.friends.filter(
      (id) => id.toString() !== friendId
    );
    friend.friends = friend.friends.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await user.save();
    await friend.save();

    res.json({ message: "Friend removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
