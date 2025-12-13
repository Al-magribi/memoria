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
    const matchQuery = {};
    if (search) {
      const searchRegex = new RegExp(search, "i"); // 'i' = case-insensitive

      // --- PERUBAIKAN DI SINI ---
      // Kita tidak bisa mencari di 'fullName' virtual.
      // Gunakan $expr untuk membuat field gabungan saat runtime dan cari di sana.
      matchQuery.$expr = {
        $regexMatch: {
          input: { $concat: ["$firstName", " ", "$lastName"] }, // Membuat "Firstname Lastname"
          regex: searchRegex, // Mencocokkan dengan "Al Magribi", dll.
        },
      };
      // --- AKHIR PERUBAIKAN ---
    }

    // 2. Ambil data user dan populate 'friends' menggunakan 'match'
    const user = await User.findById(req.user._id).populate({
      path: "friends",
      // Terapkan filter pencarian pada teman
      match: matchQuery,
      // (Kode select dan options Anda lainnya tidak berubah)
      select: "firstName lastName isLogin avatar",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Kembalikan HANYA array teman yang sudah difilter
    res.status(200).json(user.friends);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get conversations (FIXED: Inclusion/Exclusion $project Error)
router.get("/get-conversations", verify(), async (req, res) => {
  try {
    const userId = req.user._id;
    const { search } = req.query;

    // Salin pipeline asli Anda
    const pipeline = [
      // 1. Match conversations
      {
        $match: { participants: userId },
      },
      // 2. Sort
      {
        $sort: { updatedAt: -1 },
      },
      // 3. Lookup unread
      {
        $lookup: {
          from: "chats",
          let: { conversationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$conversation", "$$conversationId"] },
                    { $ne: ["$sender", userId] },
                    { $not: { $in: [userId, "$readBy"] } },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "unreadInfo",
        },
      },
      // 4. Calculate unread count
      {
        $addFields: {
          unreadCount: { $ifNull: [{ $first: "$unreadInfo.count" }, 0] },
        },
      },
      // 5. Populate lastMessage
      {
        $lookup: {
          from: "chats",
          localField: "lastMessage",
          foreignField: "_id",
          as: "lastMessage",
        },
      },
      {
        $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true },
      },
      // 6. Populate sender of lastMessage
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "lastMessage.sender",
        },
      },
      {
        $unwind: {
          path: "$lastMessage.sender",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 7. Populate participants
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
        },
      },
      // (Logika Search akan disisipkan di sini)

      // 8. Project the final fields (Simpan di variabel, JANGAN langsung push)
      // Ini adalah $project ASLI Anda
      {
        $project: {
          _id: 1,
          participants: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            fullName: 1,
            isLogin: 1,
            avatar: 1,
          },
          lastMessage: {
            _id: 1,
            content: 1,
            sender: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              fullName: 1,
            },
            createdAt: 1,
            readBy: 1,
          },
          updatedAt: 1,
          unreadCount: 1,
        },
      },
    ];

    // --- 2. LOGIKA SEARCH BARU (PERBAIKAN) ---
    if (search) {
      const searchRegex = new RegExp(search, "i");

      // Stage A: $addFields (Sama seperti sebelumnya)
      const addFieldsStage = {
        $addFields: {
          matchingParticipants: {
            $filter: {
              input: "$participants",
              as: "p",
              cond: {
                $and: [
                  { $ne: ["$$p._id", userId] },
                  {
                    $regexMatch: {
                      input: {
                        $concat: ["$$p.firstName", " ", "$$p.lastName"],
                      },
                      regex: searchRegex,
                    },
                  },
                ],
              },
            },
          },
        },
      };

      // Stage B: $match (Sama seperti sebelumnya)
      const matchStage = {
        $match: {
          $expr: {
            $gt: [{ $size: "$matchingParticipants" }, 0],
          },
        },
      };

      // Stage C: $unset (INI PERBAIKANNYA)
      // Hapus field sementara 'matchingParticipants'
      const unsetStage = {
        $unset: "matchingParticipants",
      };

      // Sisipkan SEMUA stage baru SEBELUM $project terakhir
      pipeline.splice(
        pipeline.length - 1, // Ambil posisi $project (item terakhir)
        0, // Jangan hapus $project
        addFieldsStage, // Sisipkan $addFields
        matchStage, // Sisipkan $match
        unsetStage // <-- Sisipkan $unset untuk menghapus field temp
      );
    }
    // --- AKHIR LOGIKA SEARCH BARU ---

    // 3. Jalankan agregasi
    const conversations = await Conversation.aggregate(pipeline);

    res.status(200).json(conversations);
  } catch (error) {
    console.log(error); // Tampilkan error yang sebenarnya
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
      .populate("sender", "firstName lastName fullName avatar") // Ambil data pengirim
      .sort({ createdAt: "asc" }); // Urutkan dari yang terlama

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read in a conversation
router.post("/mark-as-read/:conversationId", verify(), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // 1. Verifikasi bahwa user adalah bagian dari percakapan ini
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res
        .status(403)
        .json({ message: "You are not a participant in this conversation." });
    }

    // 2. Update semua pesan dalam percakapan ini
    // Tambahkan `userId` ke `readBy` jika belum ada
    const result = await Chat.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId }, // Jangan tandai pesan sendiri sebagai 'dibaca'
        readBy: { $ne: userId }, // Hanya update jika user belum membacanya
      },
      {
        $addToSet: { readBy: userId }, // $addToSet mencegah duplikat
      }
    );

    // 3. [SOCKET.IO] Beri tahu partisipan lain bahwa pesan telah dibaca
    const io = req.io;
    if (io) {
      conversation.participants.forEach((participant) => {
        // Kirim ke semua partisipan KECUALI diri sendiri
        if (participant.toString() !== userId.toString()) {
          io.to(participant.toString()).emit("messagesRead", {
            conversationId: conversationId,
            readBy: userId,
          });
        }
      });
    }

    res.status(200).json({
      message: `Successfully marked messages as read.`,
      modifiedCount: result.modifiedCount,
    });
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

// Ger unread chat
router.get("/get-unread-chats", verify(), async (req, res) => {
  try {
    const userId = req.user._id;

    const pipeline = [
      // 1. Ambil pesan yang BUKAN dari user dan BELUM dibaca user
      {
        $match: {
          sender: { $ne: userId },
          readBy: { $ne: userId },
        },
      },
      // 2. Kelompokkan berdasarkan Conversation ID
      {
        $group: {
          _id: "$conversation",
          unreadCount: { $sum: 1 },
        },
      },
      // 3. Ambil data Conversation
      {
        $lookup: {
          from: "conversations",
          localField: "_id",
          foreignField: "_id",
          as: "conversationData",
        },
      },
      // 4. Unwind data conversation
      {
        $unwind: "$conversationData",
      },

      // --- PERBAIKAN DI SINI ---
      // 5. Filter: HANYA ambil jika userId ada di dalam array participants
      // Ini mencegah user mendapat notif dari chat orang lain
      {
        $match: {
          "conversationData.participants": userId,
        },
      },
      // -------------------------

      // 6. Ambil data User (Participant)
      {
        $lookup: {
          from: "users",
          localField: "conversationData.participants",
          foreignField: "_id",
          as: "participants",
        },
      },
      // 7. Project/Format hasil
      {
        $project: {
          _id: 0,
          conversationId: "$_id",
          unreadCount: 1,
          participant: {
            $filter: {
              input: "$participants",
              as: "p",
              cond: { $ne: ["$$p._id", userId] },
            },
          },
        },
      },
      // 8. Unwind participant
      {
        $unwind: { path: "$participant", preserveNullAndEmptyArrays: true },
      },
      // 9. Final Project
      {
        $project: {
          conversationId: 1,
          unreadCount: 1,
          participant: {
            _id: "$participant._id",
            firstName: "$participant.firstName",
            lastName: "$participant.lastName",
            avatar: "$participant.avatar",
            isLogin: "$participant.isLogin",
          },
        },
      },
    ];

    const unreadConversations = await Chat.aggregate(pipeline);

    const totalUnreadCount = unreadConversations.reduce(
      (acc, item) => acc + item.unreadCount,
      0
    );

    res.status(200).json({
      totalUnreadCount: totalUnreadCount,
      unreadConversations: unreadConversations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
