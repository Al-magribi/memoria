import "dotenv/config";
import app from "./app.js";
import { dbClient } from "./config/cofing.js";
import { createServer } from "http";
import { Server } from "socket.io";
import Chat from "./models/ChatSchema.js";
import jwt from "jsonwebtoken";

const server = createServer(app);
// Ganti inisialisasi io agar mendukung CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Ganti jika frontend berjalan di port/domain lain
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Store online users
const onlineUsers = new Map();

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  // Add user to online users
  onlineUsers.set(socket.userId, socket.id);

  // Emit online status to all connected clients
  io.emit("userOnline", socket.userId);

  // Join user to their personal room
  socket.join(socket.userId);

  // Handle joining a specific chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  // Handle leaving a chat room
  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
  });

  // Handle sending a message
  socket.on("sendMessage", async (data) => {
    try {
      const { chatId, content, messageType = "text", fileUrl = null } = data;

      // Find chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit("error", { message: "Chat not found" });
        return;
      }

      // Add message to chat
      await chat.addMessage(socket.userId, content, messageType, fileUrl);

      // Populate sender information
      const populatedChat = await Chat.findById(chatId)
        .populate("messages.sender", "username profilePicture")
        .populate("participants", "username profilePicture");

      const newMessage =
        populatedChat.messages[populatedChat.messages.length - 1];

      // Emit message to all users in the chat room
      io.to(chatId).emit("newMessage", {
        chatId,
        message: newMessage,
        unreadCounts: Object.fromEntries(chat.unreadCount),
      });

      // Emit updated chat list to participants
      populatedChat.participants.forEach((participant) => {
        if (participant._id.toString() !== socket.userId) {
          io.to(participant._id.toString()).emit("chatUpdated", {
            chatId,
            lastMessage: newMessage,
            unreadCount: chat.unreadCount.get(participant._id.toString()) || 0,
          });
        }
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle marking messages as read
  socket.on("markAsRead", async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit("error", { message: "Chat not found" });
        return;
      }

      await chat.markAsRead(socket.userId);

      // Emit read status to other participants
      socket.to(chatId).emit("messagesRead", {
        chatId,
        readBy: socket.userId,
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to mark messages as read" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("userTyping", {
      chatId: data.chatId,
      userId: socket.userId,
    });
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.chatId).emit("userStopTyping", {
      chatId: data.chatId,
      userId: socket.userId,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    io.emit("userOffline", socket.userId);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(process.env.PORT, async () => {
  // Ensure MongoDB connection is established
  console.log(`Server is running on port ${process.env.PORT}`);
  try {
    await dbClient;
    console.log("MongoDB connection ready");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
});
