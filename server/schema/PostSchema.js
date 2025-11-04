import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      required: [true, "Reply text is required"],
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      required: [true, "Comment text is required"],
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: true,
      required: function () {
        // Konten tidak wajib jika ada media (gambar/video)
        return !this.media || this.media.length === 0;
      },
    },
    media: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Untuk efisiensi, kita bisa menyimpan jumlah dalam properti terpisah
    // yang diperbarui menggunakan middleware.
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },

    location: {
      place_id: { type: String },
      display_name: { type: String },
    },

    // Kontrol privasi untuk setiap post
    privacy: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware untuk memperbarui jumlah likes, comments, dan shares
postSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  if (this.isModified('comments')) {
    this.commentsCount = this.comments.length;
  }
  if (this.isModified('shares')) {
    this.sharesCount = this.shares.length;
  }
  next();
});


// Populate user details on find
postSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName username avatar",
  });
  this.populate({
    path: "comments.user",
    select: "firstName lastName username avatar",
  });
  this.populate({
    path: "comments.replies.user",
    select: "firstName lastName username avatar",
  });
  next();
});


const Post = mongoose.model("Post", postSchema);

export default Post;