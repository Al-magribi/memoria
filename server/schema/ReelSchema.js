import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

// Enable recursive replies by adding the field after definition
commentSchema.add({
  replies: [commentSchema],
});

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
  return this.likes.length;
});

// Virtual property for comment count
ReelSchema.virtual("commentCount").get(function () {
  // This is a simplistic count. A more accurate count would recursively sum all replies.
  let count = this.comments.length;
  this.comments.forEach((comment) => {
    const countReplies = (c) => {
      count += c.replies.length;
      c.replies.forEach(countReplies);
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