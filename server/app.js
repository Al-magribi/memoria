import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import RouterUser from "./router/user/routerUser.js";
import RouterPost from "./router/post/routerPost.js";
import RouterFriendship from "./router/friendship/routerFriendship.js";
import RouterNotification from "./router/notification/routerNotification.js";
import RouterChat from "./router/chat/routerChat.js";
import RouterStory from "./router/story/routerStory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/profiles", express.static(path.join(__dirname, "profiles")));

app.use("/api/auth", RouterUser);
app.use("/api/post", RouterPost);
app.use("/api/friendship", RouterFriendship);
app.use("/api/notifications", RouterNotification);
app.use("/api/chat", RouterChat);
app.use("/api/story", RouterStory);

export default app;
