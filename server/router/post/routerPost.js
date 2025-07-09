import express from "express";
import Post from "../../models/PostSchema.js";
import User from "../../models/UserSchema.js";
import { verify } from "../../middleware/verify.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/posts");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}${extension}`;
    cb(null, filename);
  },
});
const postUpload = multer({ storage: postStorage });

const router = express.Router();

// Create a new post
router.post(
  "/add-post",
  verify(),
  postUpload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { content, privacy, taggedUsers, location } = req.body;
      const userId = req.user._id;
      const images = req.files["images"]
        ? req.files["images"].map((f) => `/assets/posts/${f.filename}`)
        : [];
      const videos = req.files["videos"]
        ? req.files["videos"].map((f) => `/assets/posts/${f.filename}`)
        : [];
      const post = new Post({
        author: userId,
        content,
        privacy,
        taggedUsers: taggedUsers ? JSON.parse(taggedUsers) : [],
        location: location ? JSON.parse(location) : undefined,
        images,
        videos,
      });
      await post.save();
      res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get feed posts (paginated)
router.get("/get-feed-posts", verify(), async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const posts = await Post.getFeedPosts(userId, page, limit);
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get my posts (paginated)
router.get("/get-my-posts", verify(), async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const posts = await Post.getMyPosts(userId, page, limit);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single post with comments
router.get("/:postId", verify(), async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const post = await Post.getPostWithComments(postId, userId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a post
router.put(
  "/update-post/:postId",
  verify(),
  postUpload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { postId } = req.params;
      const {
        content,
        privacy,
        taggedUsers,
        location,
        removeImages,
        removeVideos,
      } = req.body;

      const userId = req.user._id;

      const post = await Post.findById(postId);

      if (!post) return res.status(404).json({ message: "Post not found" });

      if (post.author.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Update text content
      if (content !== undefined) post.content = content;
      if (privacy) post.privacy = privacy;
      if (taggedUsers) post.taggedUsers = JSON.parse(taggedUsers);
      if (location) post.location = JSON.parse(location);

      // Handle images update
      if (req.files["images"]) {
        // Delete old image files
        if (post.images && post.images.length > 0) {
          for (const oldImage of post.images) {
            const oldFileName = oldImage.split("/").pop();
            const oldImagePath = path.join(
              "./server/assets/posts",
              oldFileName
            );
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log("Old image deleted:", oldFileName);
            }
          }
        }

        // Set new images
        post.images = req.files["images"].map(
          (f) => `/assets/posts/${f.filename}`
        );
      } else if (removeImages) {
        // Handle removal of specific images
        const imagesToRemove = JSON.parse(removeImages);
        if (post.images && post.images.length > 0) {
          // Delete files that are being removed
          for (const imageIndex of imagesToRemove) {
            if (post.images[imageIndex]) {
              const oldFileName = post.images[imageIndex].split("/").pop();
              const oldImagePath = path.join(
                "./server/assets/posts",
                oldFileName
              );
              if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log("Image deleted:", oldFileName);
              }
            }
          }
          // Remove images from array
          post.images = post.images.filter(
            (_, index) => !imagesToRemove.includes(index)
          );
        }
      }

      // Handle videos update
      if (req.files["videos"]) {
        // Delete old video files
        if (post.videos && post.videos.length > 0) {
          for (const oldVideo of post.videos) {
            const oldFileName = oldVideo.split("/").pop();
            const oldVideoPath = path.join(
              "./server/assets/posts",
              oldFileName
            );
            if (fs.existsSync(oldVideoPath)) {
              fs.unlinkSync(oldVideoPath);
              console.log("Old video deleted:", oldFileName);
            }
          }
        }
        // Set new videos
        post.videos = req.files["videos"].map(
          (f) => `/assets/posts/${f.filename}`
        );
      } else if (removeVideos) {
        // Handle removal of specific videos
        const videosToRemove = JSON.parse(removeVideos);
        if (post.videos && post.videos.length > 0) {
          // Delete files that are being removed
          for (const videoIndex of videosToRemove) {
            if (post.videos[videoIndex]) {
              const oldFileName = post.videos[videoIndex].split("/").pop();
              const oldVideoPath = path.join(
                "./server/assets/posts",
                oldFileName
              );
              if (fs.existsSync(oldVideoPath)) {
                fs.unlinkSync(oldVideoPath);
                console.log("Video deleted:", oldFileName);
              }
            }
          }
          // Remove videos from array
          post.videos = post.videos.filter(
            (_, index) => !videosToRemove.includes(index)
          );
        }
      }

      post.isEdited = true;
      await post.save();

      // Populate author info for response
      await post.populate("author", "firstName lastName profilePicture");

      res.json({ message: "Post updated successfully", post });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete a post (soft delete)
router.delete("/delete-post/:postId", verify(), async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete associated image files
    if (post.images && post.images.length > 0) {
      for (const image of post.images) {
        const imageFileName = image.split("/").pop();
        const imagePath = path.join("./server/assets/posts", imageFileName);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("Post image deleted:", imageFileName);
        }
      }
    }

    // Delete associated video files
    if (post.videos && post.videos.length > 0) {
      for (const video of post.videos) {
        const videoFileName = video.split("/").pop();
        const videoPath = path.join("./server/assets/posts", videoFileName);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
          console.log("Post video deleted:", videoFileName);
        }
      }
    }

    post.isDeleted = true;
    await post.save();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to a post
router.post("/add-comment/:postId", verify(), async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.user;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const commentData = {
      content,
      author: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        profilePicture: user.profilePicture,
      },
    };
    await post.addComment(commentData);
    res.status(201).json({
      message: "Comment added successfully",
      comment: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a reply to a comment
router.post(
  "/add-reply/:postId/comments/:commentId",
  verify(),
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const { content } = req.body;
      const user = req.user;
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      const replyData = {
        content,
        author: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          profilePicture: user.profilePicture,
        },
      };
      await post.addReply(parseInt(commentId), replyData);
      res.status(201).json({
        message: "Reply added successfully",
        reply: post.comments
          .find((c) => c.id === parseInt(commentId))
          .replies.slice(-1)[0],
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Like/unlike a comment
router.post(
  "/like-comment/:postId/comments/:commentId",
  verify(),
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const userId = req.user.id;
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      await post.toggleCommentLike(parseInt(commentId), userId);
      res.json({ message: "Comment like toggled successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
