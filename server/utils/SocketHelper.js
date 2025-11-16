import User from "../schema/UserSchema.js";

export const emitToFriends = async (req, userId, eventName) => {
  try {
    const io = req.io;

    // Cari pengguna dan hanya ambil field 'friends'
    const user = await User.findById(userId).select("friends");

    io.to(userId).emit(eventName);

    if (user && user.friends.length > 0) {
      user.friends.forEach((friendId) => {
        io.to(friendId.toString()).emit(eventName);
      });
    }
  } catch (error) {
    // Log error agar tidak menghentikan request utama
    console.error("Error emitting socket event to friends:", error);
  }
};
