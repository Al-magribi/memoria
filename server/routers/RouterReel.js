import { Router } from "express";
import multer from "multer";
import { verify } from "../middlewares/Verify.js";
import Reel from "../schema/ReelSchema.js";
import User from "../schema/UserSchema.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { compressVideo } from "../utils/VideoCompress.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Use memory storage to process files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadDir = path.resolve(__dirname, "../assets/reels");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create a new reel
router.post(
  "/create-reel",
  verify(),
  upload.single("video"),
  async (req, res) => {
    try {
      const { caption } = req.body;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: "Video file is required" });
      }

      const video = req.file;
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = ".mp4";
      const filename = `reel-${uniqueSuffix}${extension}`;
      const fileUrl = path.join(uploadDir, filename);

      await compressVideo(video.buffer, fileUrl);

      const newReel = new Reel({
        user: userId,
        caption,
        video: `/assets/reels/${filename}`,
      });

      await newReel.save();

      res.status(201).json({ message: "Reel created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all reels from user and friends
router.get("/get-reels", verify(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendIds = user.friends;
    const userIds = [req.user.id, ...friendIds];

    const reels = await Reel.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.status(200).json(reels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single reel by ID
router.get("/:reelId", async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId).populate("user");
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }
    res.status(200).json(reel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update a reel's caption & video
router.put(
  "/update/:reelId",
  verify(),
  upload.single("video"),
  async (req, res) => {
    try {
      const { caption } = req.body;
      const reel = await Reel.findById(req.params.reelId);

      if (!reel) {
        return res.status(404).json({ message: "Reel not found" });
      }

      if (reel.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (req.file) {
        // Delete old video
        const oldVideoPath = path.join(uploadDir, path.basename(reel.video));
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }

        // Save new video
        const video = req.file;
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = ".mp4";
        const filename = `reel-${uniqueSuffix}${extension}`;
        const fileUrl = path.join(uploadDir, filename);

        await compressVideo(video.buffer, fileUrl);
        reel.video = `/assets/reels/${filename}`;
      }

      reel.caption = caption;
      await reel.save();

      res.status(200).json({ message: "Reel updated successfully", reel });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete a reel
router.delete("/:reelId", verify(), async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    if (reel.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete video from filesystem
    const filePath = path.join(uploadDir, path.basename(reel.video));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await reel.deleteOne();

    res.status(200).json({ message: "Reel deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike a reel
router.post("/:reelId/like", verify(), async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    const userId = req.user.id;
    const userIndex = reel.likes.indexOf(userId);

    if (userIndex === -1) {
      reel.likes.push(userId);
    } else {
      reel.likes.splice(userIndex, 1);
    }

    await reel.save();
    res.status(200).json({ message: "Reel like status updated", reel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to a reel
router.post("/:reelId/comments", verify(), async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    const { text } = req.body;
    const userId = req.user.id;

    const comment = {
      user: userId,
      text,
    };

    reel.comments.push(comment);
    await reel.save();
    res.status(201).json({ message: "Comment added", reel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a comment from a reel
router.delete("/:reelId/comments/:commentId", verify(), async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);
    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    const comment = reel.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.deleteOne();
    await reel.save();
    res.status(200).json({ message: "Comment deleted", reel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Add a reply to a comment
router.post(
  "/:reelId/comments/:commentId/replies",
  verify(),
  async (req, res) => {
    try {
      const reel = await Reel.findById(req.params.reelId);
      if (!reel) {
        return res.status(404).json({ message: "Reel not found" });
      }

      const comment = reel.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const { text } = req.body;
      const userId = req.user.id;

      const reply = {
        user: userId,
        text,
      };

      comment.replies.push(reply);
      await reel.save();
      res.status(201).json({ message: "Reply added", reel });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete a reply from a comment
router.delete(
  "/:reelId/comments/:commentId/replies/:replyId",
  verify(),
  async (req, res) => {
    try {
      const reel = await Reel.findById(req.params.reelId);
      if (!reel) {
        return res.status(404).json({ message: "Reel not found" });
      }

      const comment = reel.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const reply = comment.replies.id(req.params.replyId);
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }

      if (reply.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      reply.deleteOne();
      await reel.save();
      res.status(200).json({ message: "Reply deleted", reel });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
