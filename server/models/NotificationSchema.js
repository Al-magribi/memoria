import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "friend_request",
        "friend_accepted",
        "post_like",
        "post_comment",
        "comment_like",
        "story_view",
        "message",
        "mention",
        "tag",
      ],
      required: true,
    },

    // Related content
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    friendship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Friendship",
    },

    // Notification content
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // Media for notification
    image: {
      type: String,
    },

    // Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },

    // Delivery status
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ sender: 1, recipient: 1, type: 1 });

// Instance Methods
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsDelivered = function () {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

// Static Methods
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
  });
};

notificationSchema.statics.getNotifications = function (
  userId,
  page = 1,
  limit = 20
) {
  return this.find({
    recipient: userId,
  })
    .populate("sender", "firstName lastName username profilePicture")
    .populate("post", "content images")
    .populate("comment", "content")
    .populate("friendship")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

notificationSchema.statics.createFriendRequestNotification = function (
  requesterId,
  recipientId
) {
  const User = mongoose.model("User");

  return User.findById(requesterId).then((requester) => {
    return this.create({
      recipient: recipientId,
      sender: requesterId,
      type: "friend_request",
      title: "Friend Request",
      body: `${requester.firstName} ${requester.lastName} sent you a friend request`,
      image: requester.profilePicture,
    });
  });
};

notificationSchema.statics.createFriendAcceptedNotification = function (
  accepterId,
  requesterId
) {
  const User = mongoose.model("User");

  return User.findById(accepterId).then((accepter) => {
    return this.create({
      recipient: requesterId,
      sender: accepterId,
      type: "friend_accepted",
      title: "Friend Request Accepted",
      body: `${accepter.firstName} ${accepter.lastName} accepted your friend request`,
      image: accepter.profilePicture,
    });
  });
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
