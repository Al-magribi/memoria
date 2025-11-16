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

const ReelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: String,
      required: [true, "Reel must have a video"],
    },
    caption: {
      type: String,
      trim: true,
      maxLength: 2200,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    // You might want to track views as well
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for like count
ReelSchema.virtual("likeCount").get(function () {
  // --- PERUBAHAN DI SINI ---
  // Tambahkan pengecekan untuk memastikan 'this.likes' ada
  return this.likes ? this.likes.length : 0;
});

// Virtual property for comment count
ReelSchema.virtual("commentCount").get(function () {
  // --- PERUBAHAN DI SINI ---
  // Tambahkan pengecekan untuk memastikan 'this.comments' ada
  if (!this.comments) {
    return 0;
  }
  // --- PERUBAHAN SELESAI ---

  let count = this.comments.length;
  this.comments.forEach((comment) => {
    const countReplies = (c) => {
      // --- PERUBAHAN DI SINI ---
      // Juga tambahkan pengecekan di rekursif
      if (c.replies) {
        count += c.replies.length;
        c.replies.forEach(countReplies);
      }
      // --- PERUBAHAN SELESAI ---
    };
    countReplies(comment);
  });
  return count;
});

// Pre-find hook to populate user details
ReelSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName avatar",
  });
  next();
});

// Pre-find hook to populate comments and replies with user details
ReelSchema.pre(/^find/, function (next) {
  const populateComments = (comment) => {
    return {
      path: "comments",
      populate: [
        {
          path: "user",
          select: "firstName lastName avatar",
        },
        {
          path: "replies",
          populate: {
            path: "user",
            select: "firstName lastName avatar",
          },
        },
      ],
    };
  };

  this.populate(populateComments());
  next();
});

const Reel = mongoose.model("Reel", ReelSchema);
export default Reel;
