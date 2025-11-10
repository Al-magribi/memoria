import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referensi ke UserSchema Anda
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation", // Referensi ke Conversation
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: true, // Otomatis menambah createdAt dan updatedAt
  }
);

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Daftar pengguna dalam percakapan ini
      },
    ],
    // 'messages' tidak disimpan di sini untuk performa.
    // Kita akan query 'Message' berdasarkan 'conversation' ID.
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat", // Referensi ke pesan terakhir (untuk preview)
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model("Chat", ChatSchema);
export const Conversation = mongoose.model("Conversation", ConversationSchema);
