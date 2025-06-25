import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import RouterUser from "./router/user/routerUser.js";
import RouterPost from "./router/post/routerPost.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/profiles", express.static(path.join(__dirname, "profiles")));

app.use("/api/auth", RouterUser);
app.use("/api/post", RouterPost);

export default app;
