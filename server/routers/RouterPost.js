import { Router } from "express";
import multer from "multer";
import { verify } from "../middlewares/Verify.js";
import Post from "../schema/PostSchema.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../schema/UserSchema.js";
import { compressVideo } from "../utils/VideoCompress.js";
import { compressImage } from "../utils/ImageCompress.js";
import { emitToFriends } from "../utils/SocketHelper.js";
import Notif from "../schema/NotifSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Dynamic upload directory
const uploadDir = path.resolve(__dirname, "../assets/posts");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage to process files with sharp
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/create-post",
  verify(),
  upload.array("files"),
  async (req, res) => {
    try {
      const { content, isPrivate, location } = req.body;
      const userId = req.user.id;

      const media = [];

      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          let filename;
          let fileUrl;

          if (file.mimetype.startsWith("image")) {
            filename = `post-${uniqueSuffix}.webp`;
            fileUrl = path.join(uploadDir, filename);

            await compressImage(file.buffer, fileUrl);

            media.push({ url: `/assets/posts/${filename}`, type: "image" });
          } else if (file.mimetype.startsWith("video")) {
            filename = `post-${uniqueSuffix}.mp4`;
            fileUrl = path.join(uploadDir, filename);

            await compressVideo(file.buffer, fileUrl);

            media.push({ url: `/assets/posts/${filename}`, type: "video" });
          }
        }
      }

      const newPost = new Post({
        user: userId,
        content,
        media,
        privacy: isPrivate === "true" ? "private" : "public",
        location: location ? JSON.parse(location) : undefined,
      });

      await newPost.save();

      await emitToFriends(req, userId, "post");

      res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.put("/:postId", verify(), upload.array("files"), async (req, res) => {
  try {
    const { content, isPrivate, location, existingMedia } = req.body;
    const userId = req.user.id;
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "User not authorized to edit this post" });
    }

    // Handle media updates
    const newMedia = [];
    const existingMediaUrls = existingMedia ? JSON.parse(existingMedia) : [];

    // Keep media that are still present
    const keptMedia = post.media.filter((m) =>
      existingMediaUrls.includes(m.url)
    );
    newMedia.push(...keptMedia);

    // Delete media that were removed
    const removedMedia = post.media.filter(
      (m) => !existingMediaUrls.includes(m.url)
    );
    for (const media of removedMedia) {
      const filePath = path.join(uploadDir, path.basename(media.url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Add new files
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        let filename;
        let fileUrl;

        if (file.mimetype.startsWith("image")) {
          filename = `post-${uniqueSuffix}.webp`;
          fileUrl = path.join(uploadDir, filename);
          await compressImage(file.buffer, fileUrl);
          newMedia.push({ url: `/assets/posts/${filename}`, type: "image" });
        } else if (file.mimetype.startsWith("video")) {
          filename = `post-${uniqueSuffix}.mp4`;
          fileUrl = path.join(uploadDir, filename);

          await compressVideo(file.buffer, fileUrl);
          newMedia.push({ url: `/assets/posts/${filename}`, type: "video" });
        }
      }
    }

    post.content = content;
    post.privacy = isPrivate === "true" ? "private" : "public";
    post.location = location ? JSON.parse(location) : post.location;
    post.media = newMedia;
    post.edited = true;
    post.updatedAt = Date.now();

    await post.save();

    await emitToFriends(req, userId, "post");

    res.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:postId", verify(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete media from filesystem
    if (post.media && post.media.length > 0) {
      for (const media of post.media) {
        const filePath = path.join(uploadDir, path.basename(media.url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await post.deleteOne();

    await emitToFriends(req, req.user.id, "post");

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/my-posts", verify(), async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => ({
      id: post._id,
      user: post.user,
      fullName: post.user.fullName,
      avatar: post.user.avatar,
      timestamp: post.createdAt,
      content: post.content,
      images: post.media.filter((m) => m.type === "image"),
      videos: post.media.filter((m) => m.type === "video"),
      likes: post.likesCount,
      isLiked: post.likes.includes(req.user.id),
      comments: post.commentsCount,
      shares: post.sharesCount,
      location: post.location,
      commentsData: post.comments.map((comment) => ({
        id: comment._id,
        user: comment.user.fullName,
        avatar: comment.user.avatar,
        text: comment.text,
        likes: comment.likes.length,
        timestamp: comment.createdAt,
        replies: comment.replies.map((reply) => ({
          id: reply._id,
          user: reply.user.fullName,
          avatar: reply.user.avatar,
          text: reply.text,
          likes: reply.likes.length,
          timestamp: reply.createdAt,
        })),
      })),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/user-posts/:userId", verify(), async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => ({
      id: post._id,
      user: post.user,
      fullName: post.user.fullName,
      avatar: post.user.avatar,
      timestamp: post.createdAt,
      content: post.content,
      images: post.media.filter((m) => m.type === "image"),
      videos: post.media.filter((m) => m.type === "video"),
      likes: post.likesCount,
      isLiked: post.likes.includes(req.user.id),
      comments: post.commentsCount,
      shares: post.sharesCount,
      location: post.location,
      commentsData: post.comments.map((comment) => ({
        id: comment._id,
        user: comment.user.fullName,
        avatar: comment.user.avatar,
        text: comment.text,
        likes: comment.likes.length,
        timestamp: comment.createdAt,
        replies: comment.replies.map((reply) => ({
          id: reply._id,
          user: reply.user.fullName,
          avatar: reply.user.avatar,
          text: reply.text,
          likes: reply.likes.length,
          timestamp: reply.createdAt,
        })),
      })),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/feed", verify(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendIds = user.friends;
    const userIds = [req.user.id, ...friendIds];

    const posts = await Post.find({
      user: { $in: userIds },
      privacy: { $in: ["public", "friends"] },
    })
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => ({
      id: post._id,
      user: post.user,
      fullName: post.user.fullName,
      avatar: post.user.avatar,
      timestamp: post.createdAt,
      content: post.content,
      images: post.media.filter((m) => m.type === "image"),
      videos: post.media.filter((m) => m.type === "video"),
      likes: post.likesCount,
      isLiked: post.likes.includes(req.user.id),
      comments: post.commentsCount,
      shares: post.sharesCount,
      location: post.location,
      commentsData: post.comments.map((comment) => ({
        id: comment._id,
        user: comment.user.fullName,
        avatar: comment.user.avatar,
        text: comment.text,
        likes: comment.likes.length,
        timestamp: comment.createdAt,
        replies: comment.replies.map((reply) => ({
          id: reply._id,
          user: reply.user.fullName,
          avatar: reply.user.avatar,
          text: reply.text,
          likes: reply.likes.length,
          timestamp: reply.createdAt,
        })),
      })),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:postId", verify(), async (req, res) => {
  try {
    console.log(req.params.postId);

    const post = await Post.findById(req.params.postId).populate(
      "user",
      "fullName avatar"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const formattedPost = {
      id: post._id,
      user: post.user,
      fullName: post.user.fullName,
      avatar: post.user.avatar,
      timestamp: post.createdAt,
      content: post.content,
      images: post.media.filter((m) => m.type === "image"),
      videos: post.media.filter((m) => m.type === "video"),
      likes: post.likesCount,
      isLiked: post.likes.includes(req.user.id),
      comments: post.commentsCount,
      shares: post.sharesCount,
      location: post.location,
      commentsData: post.comments.map((comment) => ({
        id: comment._id,
        user: comment.user.fullName,
        avatar: comment.user.avatar,
        text: comment.text,
        likes: comment.likes.length,
        timestamp: comment.createdAt,
        replies: comment.replies.map((reply) => ({
          id: reply._id,
          user: reply.user.fullName,
          avatar: reply.user.avatar,
          text: reply.text,
          likes: reply.likes.length,
          timestamp: reply.createdAt,
        })),
      })),
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Like/Unlike a post
router.post("/:postId/like", verify(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    console.log(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;
    const userIndex = post.likes.indexOf(userId);

    if (userIndex === -1) {
      // Like the post
      post.likes.push(userId);
      if (post.user.toString() !== userId) {
        const notif = new Notif({
          recipient: post.user,
          sender: userId,
          type: "like",
          targetPost: post._id,
        });
        await notif.save();

        await emitToFriends(req, userId, "notification");
      }
    } else {
      // Unlike the post
      post.likes.splice(userIndex, 1);
    }

    await post.save();

    await emitToFriends(req, userId, "post");

    res.status(200).json({
      message: "Post like status updated",
      post: {
        id: post._id,
        likes: post.likesCount,
        isLiked: post.likes.includes(req.user.id),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment
router.post("/:postId/comments", verify(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { text } = req.body;
    const userId = req.user.id;

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);
    await post.save();

    if (post.user.toString() !== userId) {
      const notif = new Notif({
        recipient: post.user,
        sender: userId,
        type: "comment",
        targetPost: post._id,
      });
      await notif.save();
      req.io.to(post.user.toString()).emit("notification", notif);
    }

    await emitToFriends(req, userId, "post");

    res.status(201).json({ message: "Comment added", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a comment
router.put("/:postId/comments/:commentId", verify(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { text } = req.body;
    comment.text = text;
    await post.save();

    await emitToFriends(req, userId, "post");

    res.status(200).json({ message: "Comment updated", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a comment
router.delete("/:postId/comments/:commentId", verify(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.deleteOne();
    await post.save();

    await emitToFriends(req, userId, "post");

    res.status(200).json({ message: "Comment deleted", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a reply to a comment
router.post(
  "/:postId/comments/:commentId/replies",
  verify(),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const comment = post.comments.id(req.params.commentId);
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

      await post.save();

      await emitToFriends(req, userId, "post");

      res.status(201).json({ message: "Reply added", post });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update a reply
router.put(
  "/:postId/comments/:commentId/replies/:replyId",
  verify(),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const comment = post.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const reply = comment.replies.id(req.params.replyId);
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }

      if (reply.user._id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { text } = req.body;
      reply.text = text;
      await post.save();

      await emitToFriends(req, userId, "post");

      res.status(200).json({ message: "Reply updated", post });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete a reply
router.delete(
  "/:postId/comments/:commentId/replies/:replyId",
  verify(),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const comment = post.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const reply = comment.replies.id(req.params.replyId);
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }

      if (reply.user._id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      reply.deleteOne();

      await post.save();

      await emitToFriends(req, userId, "post");

      res.status(200).json({ message: "Reply deleted", post });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/anything", verify(), async (req, res) => {
  try {
    const { search } = req.query;

    const searchRegex = new RegExp(search, "i");

    const posts = await Post.find({ content: searchRegex, privacy: "public" })
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => ({
      id: post._id,
      user: post.user,
      fullName: post.user.fullName,
      avatar: post.user.avatar,
      timestamp: post.createdAt,
      content: post.content,
      images: post.media.filter((m) => m.type === "image"),
      videos: post.media.filter((m) => m.type === "video"),
      likes: post.likesCount,
      isLiked: post.likes.includes(req.user.id),
      comments: post.commentsCount,
      shares: post.sharesCount,
      location: post.location,
      commentsData: post.comments.map((comment) => ({
        id: comment._id,
        user: comment.user.fullName,
        avatar: comment.user.avatar,
        text: comment.text,
        likes: comment.likes.length,
        timestamp: comment.createdAt,
        replies: comment.replies.map((reply) => ({
          id: reply._id,
          user: reply.user.fullName,
          avatar: reply.user.avatar,
          text: reply.text,
          likes: reply.likes.length,
          timestamp: reply.createdAt,
        })),
      })),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
