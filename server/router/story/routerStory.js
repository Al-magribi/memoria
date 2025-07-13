import express from "express";
import { verify } from "../../middleware/verify.js";
import multer from "multer";
import path from "path";
import Story from "../../models/StorySchema.js";
import fs from "fs";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB

const storyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/stories");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}${extension}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

const storyUpload = multer({
  storage: storyStorage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

const router = express.Router();

// Get all stories, grouped by user
router.get("/get-stories", verify(), async (req, res) => {
  try {
    const stories = await Story.find()
      .populate("user", "_id firstName lastName profilePicture")
      .sort({ createdAt: -1 });
    // Group by user
    const grouped = {};
    stories.forEach((story) => {
      const userId = story.user._id;
      if (!grouped[userId]) {
        grouped[userId] = {
          user: story.user,
          stories: [],
        };
      }
      grouped[userId].stories.push(story);
    });
    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all stories for a specific user
router.get("/get-stories/:userId", verify(), async (req, res) => {
  try {
    const { userId } = req.params;
    const stories = await Story.find({ user: userId }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get detail of a single story
router.get("/story/:storyId", verify(), async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId).populate(
      "user",
      "_id firstName lastName profilePicture"
    );
    if (!story) return res.status(404).json({ error: "Story not found" });
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new story (image/video)
router.post(
  "/create-story",
  verify(),
  storyUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const fileType = req.file.mimetype.startsWith("image/")
        ? "image"
        : "video";
      const fileUrl = `/assets/stories/${req.file.filename}`;
      const story = new Story({
        user: req.user.id,
        fileUrl,
        fileType,
      });
      await story.save();
      res.status(201).json(story);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete a story
router.delete("/delete-story/:id", verify(), async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ error: "Story not found" });
    // Only owner can delete
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    // Delete file from disk
    const filePath = path.join(process.cwd(), "server", story.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await story.deleteOne();
    res.json({ message: "Story deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
