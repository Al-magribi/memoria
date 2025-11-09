import mongoose from "mongoose";

const NotifSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["like", "comment", "friend_request", "friend_request_accepted"],
      required: true,
    },
    targetPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notif = mongoose.model("Notif", NotifSchema);
export default Notif;
