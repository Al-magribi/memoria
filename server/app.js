import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

import User from "./schema/UserSchema.js";

import RouterUser from "./routers/RouterUser.js";
import RouterPost from "./routers/RouterPost.js";
import RouterFriend from "./routers/RouterFriend.js";
import RouterReel from "./routers/RouterReel.js";
import RouterNotif from "./routers/RouterNotif.js";
import RouterChat from "./routers/RouterChat.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.DOMAIN,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", RouterUser);
app.use("/api/post", RouterPost);
app.use("/api/friend", RouterFriend);
app.use("/api/reel", RouterReel);
app.use("/api/notif", RouterNotif);
app.use("/api/chat", RouterChat);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join", async (userId) => {
    socket.join(userId);
    socket.userId = userId;

    await User.findByIdAndUpdate(userId, { isLogin: true });

    const user = await User.findById(socket.userId).select("friends");

    user.friends.forEach(async (friendId) => {
      io.to(friendId.toString()).emit("status");
    });
  });

  socket.on("disconnecting", async () => {
    if (socket.userId) {
      const room = io.sockets.adapter.rooms.get(socket.userId);
      if (room && room.size === 1) {
        await User.findByIdAndUpdate(socket.userId, {
          isLogin: false,
          lastSeen: new Date(),
        });

        const user = await User.findById(socket.userId).select("friends");
        if (user && user.friends) {
          user.friends.forEach((friendId) => {
            io.to(friendId.toString()).emit("status");
          });
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`user ${socket.id} disconnected`);
  });
});

export default server;
