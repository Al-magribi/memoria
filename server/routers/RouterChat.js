import { Router } from "express";
import { verify } from "../middlewares/Verify.js";
import { Chat, Conversation } from "../schema/ChatSchema.js";
import User from "../schema/UserSchema.js";

const router = Router();

// Get my friend
router.get("/get-my-friends", verify(), async (req, res) => {
  try {
    const { search } = req.query;

    // 1. Siapkan kondisi 'match' untuk populate
    // Ini adalah filter yang akan diterapkan PADA koleksi 'User' (teman)
    const matchQuery = {};
    if (search) {
      const searchRegex = new RegExp(search, "i"); // 'i' = case-insensitive

      // Kita tidak bisa mencari 'fullName' virtual,
      // jadi kita cari di field yang menyusunnya:
      matchQuery.$or = [{ firstName: searchRegex }, { lastName: searchRegex }];
    }

    // 2. Ambil data user dan populate 'friends' menggunakan 'match'
    const user = await User.findById(req.user._id).populate({
      path: "friends",
      // Terapkan filter pencarian pada teman
      match: matchQuery,
      // Pilih field teman yang ingin dikembalikan
      // (Saya ganti 'username' dari kode Anda dengan 'avatar' sesuai skema)
      select: "firstName lastName isLogin avatar",
      // Anda juga bisa menambahkan limit/skip di sini jika perlu
      // options: { limit: 10, skip: 0 }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Kembalikan HANYA array teman yang sudah difilter
    // 'user.friends' sekarang hanya akan berisi teman yang cocok
    // dengan 'searchQuery'.
    res.status(200).json(user.friends);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});
// Get conversations
router.get("/get-conversations", verify(), async (req, res) => {
  try {
    const conversation = await Conversation.find({ participants: req.user._id })
      .populate("participants", "firstName lastName fullName isLogin avatar") // Ambil data partisipan
      .populate({
        path: "lastMessage", // Ambil data pesan terakhir
        select: "content sender timestamp",
        populate: {
          path: "sender",
          select: "firstName lastName fullName",
        }, // Ambil data pengirim pesan terakhir
      })
      .sort({ updatedAt: -1 }); // Urutkan berdasarkan yang terbaru

    res.status(200).json(conversation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get messages for one conversation
router.get("/get-chats/:conversationId", verify(), async (req, res) => {
  try {
    const { conversationId } = req.params;

    // 1. Verifikasi bahwa user adalah bagian dari percakapan ini
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(403).json({ message: "conversation not found" });
    }

    // 2. Ambil semua pesan
    const messages = await Chat.find({
      conversation: conversationId,
    })
      .populate("sender", "firstName lastName avatar") // Ambil data pengirim
      .sort({ createdAt: "asc" }); // Urutkan dari yang terlama

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Create new chats
router.post("/create-chat", verify(), async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    console.log(req.body);

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Missing receiverId or content" });
    }

    // --- BLOK YANG DIPERBAIKI (Find-then-Create) ---

    // 1. Coba cari percakapan yang ada
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 },
    });

    // 2. Jika percakapan tidak ada, buat yang baru
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      // Kita perlu menyimpannya di sini agar mendapatkan _id
      // sebelum membuat pesan baru.
      await conversation.save();
    }

    // --- AKHIR BLOK YANG DIPERBAIKI ---

    // 3. Buat pesan baru
    const newChat = new Chat({
      sender: senderId,
      content: content,
      conversation: conversation._id, // _id sekarang dijamin ada
    });

    // 4. Update 'lastMessage' di percakapan
    conversation.lastMessage = newChat._id;

    // 5. Simpan pesan baru DAN update lastMessage percakapan
    await Promise.all([newChat.save(), conversation.save()]);

    // 6. Populate data pengirim untuk dikirim via socket
    await newChat.populate("sender", "firstName lastName avatar");

    // 7. [SOCKET.IO] Kirim pesan ke penerima secara real-time
    const io = req.io; // Asumsi 'io' dari server utama Anda
    if (io) {
      // --- PERBAIKAN DI SINI ---
      // Pastikan kita menggunakan string untuk nama room Socket.IO
      // (Asumsi: Setiap user join ke room dengan nama User ID mereka)
      const senderRoom = req.user._id.toString();
      const receiverRoom = receiverId.toString();

      // Kirim event ke kedua room
      io.to(senderRoom).emit("newChat");
      io.to(receiverRoom).emit("newChat");
      // --- AKHIR PERBAIKAN ---
    } else {
      console.warn("Socket.io (req.io) not found. Real-time emit skipped.");
    }

    // 8. Kirim respons HTTP
    res.status(201).json(newChat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
