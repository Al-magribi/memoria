import { Router } from "express";
import { verify } from "../middlewares/Verify.js";
import User from "../schema/UserSchema.js";
import Notif from "../schema/NotifSchema.js";

const router = Router();

router.get("/get-online-friends", verify(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "friends",
      // Hanya populate teman yang memiliki isLogin: true
      match: { isLogin: true },
      // Tetap pilih field yang Anda inginkan
      select: "firstName lastName avatar isLogin",
    });

    res.json(user.friends);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all users and data about friend statuses
router.get("/get-users", verify(), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // Ambil istilah pencarian dari query string
    const searchTerm = req.query.search || "";

    // Find users to whom the current user has sent a request
    const usersWithMyRequest = await User.find({
      friendRequests: req.user._id,
    })
      .select("_id")
      .lean();

    const sentRequestIds = usersWithMyRequest.map((u) => u._id.toString());

    // --- MODIFIKASI DIMULAI DISINI ---

    // 1. Buat filter dasar
    const queryFilter = {
      _id: { $ne: req.user._id }, // Selalu kecualikan diri sendiri
    };

    // 2. Jika ada 'searchTerm', tambahkan filter $or untuk mencari
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i"); // 'i' untuk case-insensitive
      queryFilter.$or = [
        { firstName: regex },
        { lastName: regex },
        { username: regex },
      ];
    }

    // 3. Terapkan filter ke query dan count
    const usersQuery = User.find(queryFilter) // Gunakan queryFilter
      .select("firstName lastName username avatar")
      .skip(skip)
      .limit(limit)
      .lean();

    const users = await usersQuery;
    const totalUsers = await User.countDocuments(queryFilter); // Gunakan queryFilter

    // --- MODIFIKASI SELESAI ---

    res.json({
      users,
      sentRequests: sentRequestIds,
      totalUsers,
      hasMore: page * limit < totalUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all friends of the current user
router.get("/get-my-friends", verify(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "firstName lastName username avatar")
      .lean();
    res.json({ friends: user.friends });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all friend requests for the current user
router.get("/get-friend-requests", verify(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friendRequests", "firstName lastName username avatar")
      .lean();

    res.json({ friendRequests: user.friendRequests });
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
      return res.status(400).json({ message: "Friend request already sent" });
    }

    if (friend.friends.includes(req.user._id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    friend.friendRequests.push(req.user._id);
    await friend.save();

    const notif = new Notif({
      recipient: friendId,
      sender: req.user._id,
      type: "friend_request",
    });
    await notif.save();

    req.io.to(friendId).emit("notification", notif);

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
      return res
        .status(400)
        .json({ message: "No friend request from this user" });
    }

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== friendId
    );
    user.friends.push(friendId);

    friend.friends.push(req.user._id);

    await user.save();
    await friend.save();

    // Hapus notifikasi "friend_request" yang lama dari User B (user saat ini)
    await Notif.findOneAndDelete({
      recipient: req.user._id, // User B
      sender: friendId, // User A
      type: "friend_request",
    });
    // -------------------------

    const notif = new Notif({
      recipient: friendId,
      sender: req.user._id,
      type: "friend_request_accepted",
    });
    await notif.save();

    req.io.to(friendId).emit("notification", notif);

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
      return res
        .status(400)
        .json({ message: "No friend request from this user" });
    }

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== friendId
    );
    await user.save();

    // Hapus notifikasi yang sesuai menggunakan findOneAndDelete
    const deletedNotif = await Notif.findOneAndDelete({
      recipient: req.user._id, // User yang sedang login (penerima request)
      sender: friendId, // User yang mengirim request
      type: "friend_request",
    });

    // 2. Kirim "ping" ke teman (yang di-reject) agar me-refetch
    // (Ini akan membuat tombol "Cancel" di UI mereka berubah jadi "Add Friend")
    req.io.to(friendId).emit("notification", {
      action: "request_rejected",
    });

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
      return res
        .status(400)
        .json({ message: "No friend request sent to this user" });
    }

    friend.friendRequests = friend.friendRequests.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await friend.save();

    // Hapus notifikasi yang sesuai menggunakan findOneAndDelete
    const deletedNotif = await Notif.findOneAndDelete({
      recipient: friendId,
      sender: req.user._id,
      type: "friend_request",
    });

    // Kirim event ke si penerima (agar notifikasinya hilang)
    req.io.to(friendId).emit("notification", {
      action: "request_cancelled",
      notifId: deletedNotif?._id,
    });

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

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await user.save();
    await friend.save();

    // 2. Kirim "ping" ke teman (yang di-remove) agar me-refetch
    req.io.to(friendId).emit("notification", {
      action: "was_removed_as_friend",
    });

    res.json({ message: "Friend removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error.message" });
  }
});

export default router;
