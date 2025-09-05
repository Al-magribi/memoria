import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "video"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [messageSchema],
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ "messages.createdAt": -1 });
chatSchema.index({ updatedAt: -1 });

// Method to add a message to the chat
chatSchema.methods.addMessage = function (
  senderId,
  content,
  messageType = "text",
  fileUrl = null
) {
  const message = {
    sender: senderId,
    content,
    messageType,
    fileUrl,
    readBy: [{ user: senderId, readAt: new Date() }],
  };

  this.messages.push(message);

  // Update unread count for other participants
  this.participants.forEach((participant) => {
    if (participant.toString() !== senderId.toString()) {
      const currentCount = this.unreadCount.get(participant.toString()) || 0;
      this.unreadCount.set(participant.toString(), currentCount + 1);
    }
  });

  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function (userId) {
  this.messages.forEach((message) => {
    const alreadyRead = message.readBy.some(
      (read) => read.user.toString() === userId.toString()
    );
    if (!alreadyRead) {
      message.readBy.push({ user: userId, readAt: new Date() });
    }
  });

  // Reset unread count for this user
  this.unreadCount.set(userId.toString(), 0);

  return this.save();
};

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
