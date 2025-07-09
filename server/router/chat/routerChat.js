import express from "express";
import { verify } from "../../middleware/verify.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import Chat from "../../models/ChatSchema.js";
import User from "../../models/UserSchema.js";

const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/chats");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}${extension}`;
    cb(null, filename);
  },
});

const chatUpload = multer({ storage: chatStorage });

const router = express.Router();

// Get all chats for the current user
router.get("/chats", verify(), async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
    })
      .populate("participants", "username profilePicture")
      .populate("messages.sender", "username profilePicture")
      .sort({ updatedAt: -1 });

    // Format chats for frontend
    const formattedChats = chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (p) => p._id.toString() !== req.user.id
      );
      const lastMessage = chat.messages[chat.messages.length - 1];
      const unreadCount = chat.unreadCount.get(req.user.id) || 0;

      return {
        id: chat._id,
        name: otherParticipant?.username || "Unknown User",
        avatar: otherParticipant?.profilePicture || "/profiles/user.jpg",
        lastMessage: lastMessage?.content || "No messages yet",
        time: lastMessage?.createdAt
          ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        unread: unreadCount,
        online: false, // This will be updated via Socket.IO
        participantId: otherParticipant?._id,
      };
    });

    res.json(formattedChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

// Get chat messages
router.get("/chats/:chatId", verify(), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("participants", "username profilePicture")
      .populate(
        "messages.sender",
        "username profilePicture firstName lastName"
      );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is participant
    if (!chat.participants.some((p) => p._id.toString() === req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Mark messages as read
    await chat.markAsRead(req.user.id);

    // Format messages for frontend
    const formattedMessages = chat.messages.map((msg) => ({
      id: msg._id,
      sender: {
        id: msg.sender._id,
        username: msg.sender.username,
        profilePicture: msg.sender.profilePicture,
        fullName:
          msg.sender.fullName ||
          `${msg.sender.firstName} ${msg.sender.lastName}`,
        firstName: msg.sender.firstName,
        lastName: msg.sender.lastName,
      },
      message: msg.content,
      time: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: msg.sender._id.toString() === req.user.id,
      messageType: msg.messageType,
      fileUrl: msg.fileUrl,
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Create or get chat with a specific user
router.post("/chats", verify(), async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find existing chat first
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      $expr: { $eq: [{ $size: "$participants" }, 2] },
    });

    // Create new chat if it doesn't exist
    if (!chat) {
      chat = new Chat({
        participants: [req.user.id, participantId],
        messages: [],
        unreadCount: new Map(),
      });
      await chat.save();
    }

    // Populate the chat to get participant details
    const populatedChat = await Chat.findById(chat._id).populate(
      "participants",
      "username profilePicture"
    );

    // Format chat for frontend
    const otherParticipant = populatedChat.participants.find(
      (p) => p._id.toString() !== req.user.id
    );

    const formattedChat = {
      id: populatedChat._id,
      name: otherParticipant?.username || "Unknown User",
      avatar: otherParticipant?.profilePicture || "/profiles/user.jpg",
      lastMessage:
        populatedChat.messages.length > 0
          ? populatedChat.messages[populatedChat.messages.length - 1].content
          : "No messages yet",
      time:
        populatedChat.messages.length > 0
          ? new Date(
              populatedChat.messages[
                populatedChat.messages.length - 1
              ].createdAt
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      unread: 0,
      online: false,
      participantId: otherParticipant?._id,
    };

    res.json(formattedChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
});

// Upload chat file/image
router.post("/upload", verify(), chatUpload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/assets/chats/${req.file.filename}`;
    res.json({ fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Failed to upload file" });
  }
});

// Mark chat as read
router.put("/chats/:chatId/read", verify(), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is participant
    if (!chat.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await chat.markAsRead(req.user.id);
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
});

export default router;
