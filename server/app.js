import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

import RouterUser from "./routers/RouterUser.js";
import RouterPost from "./routers/RouterPost.js";
import RouterFriend from "./routers/RouterFriend.js";
import RouterReel from "./routers/RouterReel.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", RouterUser);
app.use("/api/post", RouterPost);
app.use("/api/friend", RouterFriend);
app.use("/api/reels", RouterReel);

export default app;
