import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },

    // Mutual friends count (cached)
    mutualFriendsCount: {
      type: Number,
      default: 0,
    },

    // Timestamps for different actions
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },

    // Block information
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    blockedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
friendshipSchema.index({ status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });
friendshipSchema.index({ requester: 1, status: 1 });

// Instance Methods
friendshipSchema.methods.accept = function () {
  this.status = "accepted";
  this.respondedAt = new Date();
  return this.save();
};

friendshipSchema.methods.reject = function () {
  this.status = "rejected";
  this.respondedAt = new Date();
  return this.save();
};

friendshipSchema.methods.block = function (blockedBy) {
  this.status = "blocked";
  this.blockedBy = blockedBy;
  this.blockedAt = new Date();
  return this.save();
};

// Static Methods
friendshipSchema.statics.findFriendship = function (user1Id, user2Id) {
  return this.findOne({
    $or: [
      { requester: user1Id, recipient: user2Id },
      { requester: user2Id, recipient: user1Id },
    ],
  });
};

friendshipSchema.statics.getFriendRequests = function (userId) {
  return this.find({
    recipient: userId,
    status: "pending",
  })
    .populate("requester", "firstName lastName username profilePicture bio")
    .sort({ requestedAt: -1 });
};

friendshipSchema.statics.getFriends = function (userId) {
  return this.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: "accepted",
  })
    .populate(
      "requester",
      "firstName lastName username profilePicture bio lastSeen"
    )
    .populate(
      "recipient",
      "firstName lastName username profilePicture bio lastSeen"
    )
    .sort({ updatedAt: -1 });
};

friendshipSchema.statics.getMutualFriends = async function (user1Id, user2Id) {
  // Get friends of user1
  const user1Friendships = await this.find({
    $or: [{ requester: user1Id }, { recipient: user1Id }],
    status: "accepted",
  });

  const user1FriendIds = user1Friendships.map((friendship) => {
    return friendship.requester.toString() === user1Id.toString()
      ? friendship.recipient
      : friendship.requester;
  });

  // Get friends of user2
  const user2Friendships = await this.find({
    $or: [{ requester: user2Id }, { recipient: user2Id }],
    status: "accepted",
  });

  const user2FriendIds = user2Friendships.map((friendship) => {
    return friendship.requester.toString() === user2Id.toString()
      ? friendship.recipient
      : friendship.requester;
  });

  // Find mutual friends
  const mutualFriendIds = user1FriendIds.filter((id) =>
    user2FriendIds.some((id2) => id.toString() === id2.toString())
  );

  // Get mutual friends details
  const User = mongoose.model("User");
  const mutualFriends = await User.find({
    _id: { $in: mutualFriendIds },
  }).select("firstName lastName username profilePicture");

  return mutualFriends;
};

friendshipSchema.statics.calculateMutualFriendsCount = async function (
  user1Id,
  user2Id
) {
  const mutualFriends = await this.getMutualFriends(user1Id, user2Id);
  return mutualFriends.length;
};

// Update mutual friends count for a friendship
friendshipSchema.methods.updateMutualFriendsCount = async function () {
  this.mutualFriendsCount = await this.constructor.calculateMutualFriendsCount(
    this.requester,
    this.recipient
  );
  return this.save();
};

// Get mutual friends count
friendshipSchema.statics.getMutualFriendsCount = async function (
  userId1,
  userId2
) {
  const mutualFriends = await this.getMutualFriends(userId1, userId2);
  return mutualFriends.length;
};

// Get friendship suggestions
friendshipSchema.statics.getSuggestions = async function (userId) {
  // Get user's friends
  const userFriendships = await this.find({
    $or: [
      { requester: userId, status: "accepted" },
      { recipient: userId, status: "accepted" },
    ],
  }).populate("requester recipient");

  const userFriendIds = userFriendships.map((friendship) => {
    const friend =
      friendship.requester._id.toString() === userId.toString()
        ? friendship.recipient._id
        : friendship.requester._id;
    return friend.toString();
  });

  // Add current user to exclude list
  userFriendIds.push(userId.toString());

  // Get existing friendship requests (pending, rejected, blocked)
  const existingFriendships = await this.find({
    $or: [{ requester: userId }, { recipient: userId }],
  });

  const existingUserIds = existingFriendships.map((friendship) => {
    const otherUser =
      friendship.requester._id.toString() === userId.toString()
        ? friendship.recipient._id
        : friendship.requester._id;
    return otherUser.toString();
  });

  // Combine all users to exclude
  const excludeIds = [...new Set([...userFriendIds, ...existingUserIds])];

  // Find users who are friends with user's friends but not friends with user
  const User = mongoose.model("User");
  const suggestions = await User.aggregate([
    {
      $match: {
        _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) },
        isActive: true,
        "privacy.profileVisibility": { $ne: "private" },
      },
    },
    {
      $lookup: {
        from: "friendships",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$status", "accepted"] },
                  {
                    $or: [
                      { $eq: ["$requester", "$$userId"] },
                      { $eq: ["$recipient", "$$userId"] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "userFriendships",
      },
    },
    {
      $addFields: {
        mutualFriendsCount: {
          $size: {
            $setIntersection: [
              "$userFriendships.requester",
              "$userFriendships.recipient",
              userFriendIds.map((id) => new mongoose.Types.ObjectId(id)),
            ],
          },
        },
      },
    },
    {
      $sort: { mutualFriendsCount: -1, createdAt: -1 },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        id: "$_id",
        firstName: 1,
        lastName: 1,
        username: 1,
        profilePicture: 1,
        bio: 1,
        mutualFriendsCount: 1,
      },
    },
  ]);

  return suggestions;
};

const Friendship = mongoose.model("Friendship", friendshipSchema);

export default Friendship;
