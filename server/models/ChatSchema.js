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
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
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

// Virtual for getting the other participant in a 1-on-1 chat
chatSchema.virtual("otherParticipant").get(function () {
  return this.participants.find(
    (participant) => participant.toString() !== this.currentUser?.toString()
  );
});

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
  this.lastMessage = this.messages[this.messages.length - 1]._id;

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

// Static method to find or create a chat between two users
chatSchema.statics.findOrCreateChat = async function (user1Id, user2Id) {
  let chat = await this.findOne({
    participants: { $all: [user1Id, user2Id] },
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  }).populate("participants", "username profilePicture");

  if (!chat) {
    chat = new this({
      participants: [user1Id, user2Id],
      messages: [],
      unreadCount: new Map(),
    });
    await chat.save();
    chat = await chat.populate("participants", "username profilePicture");
  }

  return chat;
};

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
