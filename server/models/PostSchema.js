import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{ type: String }],
    videos: [{ type: String }],
    privacy: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    taggedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    location: {
      name: String,
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        content: {
          type: String,
          required: true,
          maxlength: 1000,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        author: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          profilePicture: {
            type: String,
            required: true,
          },
        },
        likes: {
          type: Number,
          default: 0,
        },
        likedBy: [
          {
            type: Number,
          },
        ],
        replies: [
          {
            content: {
              type: String,
              required: true,
              maxlength: 1000,
              trim: true,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
            author: {
              id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
              },
              name: {
                type: String,
                required: true,
              },
              profilePicture: {
                type: String,
                required: true,
              },
            },
            likes: {
              type: Number,
              default: 0,
            },
            likedBy: [
              {
                type: Number,
              },
            ],
            replies: [],
          },
        ],
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ privacy: 1, createdAt: -1 });
postSchema.index({ "likes.user": 1 });
postSchema.index({ "comments.author.id": 1 });

// Virtuals
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});
postSchema.virtual("commentCount").get(function () {
  return this.comments ? this.comments.length : 0;
});
postSchema.virtual("totalRepliesCount").get(function () {
  if (!this.comments) return 0;
  return this.comments.reduce((total, comment) => {
    return total + (comment.replies ? comment.replies.length : 0);
  }, 0);
});

// Middleware
postSchema.post("save", async function (doc) {
  if (doc.isDeleted) return;
  const User = mongoose.model("User");
  await User.findByIdAndUpdate(doc.author, {
    $inc: { "stats.postsCount": 1 },
  });
});
postSchema.pre("save", function (next) {
  if (this.isModified("comments")) {
    this.comments.forEach((comment, index) => {
      if (!comment.id) {
        comment.id = Date.now() + index;
      }
      if (comment.replies) {
        comment.replies.forEach((reply, replyIndex) => {
          if (!reply.id) {
            reply.id = Date.now() + index + replyIndex + 1000;
          }
        });
      }
    });
  }
  next();
});

// Instance Methods
postSchema.methods.addComment = function (commentData) {
  const newComment = {
    content: commentData.content,
    createdAt: new Date(),
    author: {
      id: commentData.author.id,
      name: commentData.author.name,
      profilePicture: commentData.author.profilePicture,
    },
    likes: 0,
    likedBy: [],
    replies: [],
  };
  this.comments.push(newComment);
  return this.save();
};
postSchema.methods.addReply = function (commentId, replyData) {
  const addReplyToComment = (comments) => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        const newReply = {
          content: replyData.content,
          createdAt: new Date(),
          author: {
            id: replyData.author.id,
            name: replyData.author.name,
            profilePicture: replyData.author.profilePicture,
          },
          likes: 0,
          likedBy: [],
          replies: [],
        };
        comment.replies.push(newReply);
      } else if (comment.replies) {
        comment.replies = addReplyToComment(comment.replies);
      }
      return comment;
    });
  };
  this.comments = addReplyToComment(this.comments);
  return this.save();
};
postSchema.methods.toggleCommentLike = function (commentId, userId) {
  const toggleLikeInComments = (comments) => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        const isLiked = comment.likedBy.includes(userId);
        if (isLiked) {
          comment.likes = Math.max(0, comment.likes - 1);
          comment.likedBy = comment.likedBy.filter((id) => id !== userId);
        } else {
          comment.likes += 1;
          comment.likedBy.push(userId);
        }
      } else if (comment.replies) {
        comment.replies = toggleLikeInComments(comment.replies);
      }
      return comment;
    });
  };
  this.comments = toggleLikeInComments(this.comments);
  return this.save();
};

postSchema.methods.deleteComment = async function (commentId, userId) {
  // Temukan komentar di dalam array `comments`
  const comment = this.comments.id(commentId);

  // Jika komentar tidak ditemukan, lempar error
  if (!comment) {
    throw new Error("Comment not found");
  }

  // Verifikasi bahwa user yang menghapus adalah pemilik komentar
  // Gunakan .equals() untuk membandingkan ObjectId
  if (!comment.author.id.equals(userId)) {
    throw new Error("Not authorized");
  }

  // Hapus komentar dari array
  comment.deleteOne();

  // Simpan perubahan pada dokumen post
  return this.save();
};

// Static Methods
postSchema.statics.getPostWithComments = function (postId, userId) {
  return this.findById(postId)
    .populate("author", "firstName lastName profilePicture")
    .lean()
    .then((post) => {
      if (!post) return null;
      const addIsLikedToComments = (comments) => {
        return comments.map((comment) => ({
          ...comment,
          isLiked: comment.likedBy.includes(userId),
          replies: comment.replies ? addIsLikedToComments(comment.replies) : [],
        }));
      };
      post.comments = addIsLikedToComments(post.comments);
      return post;
    });
};
postSchema.statics.getFeedPosts = function (userId, page = 1, limit = 10) {
  return this.find({
    privacy: { $in: ["public", "friends"] },
    isDeleted: false,
  })
    .populate("author", "firstName lastName profilePicture")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .then((posts) => {
      return posts.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => ({
          ...comment,
          isLiked: comment.likedBy.includes(userId),
          replies: comment.replies.map((reply) => ({
            ...reply,
            isLiked: reply.likedBy.includes(userId),
          })),
        })),
      }));
    });
};
postSchema.statics.getMyPosts = function (userId, page = 1, limit = 10) {
  return this.find({
    author: userId,
    isDeleted: false,
  })
    .populate("author", "firstName lastName profilePicture")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .then((posts) => {
      return posts.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => ({
          ...comment,
          isLiked: comment.likedBy.includes(userId),
          replies: comment.replies.map((reply) => ({
            ...reply,
            isLiked: reply.likedBy.includes(userId),
          })),
        })),
      }));
    });
};

const Post = mongoose.model("Post", postSchema);
export default Post;
