import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    // Basic Information
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    // Profile Information
    profilePicture: {
      type: String,
      default: "/assets/profiles/user.jpg",
    },
    coverPhoto: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    title: {
      type: String,
      maxlength: 100,
      default: "",
    },

    // Personal Information
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    location: {
      type: String,
      maxlength: 100,
      default: "",
    },
    work: {
      type: String,
      maxlength: 200,
      default: "",
    },
    education: {
      type: String,
      maxlength: 200,
      default: "",
    },
    website: {
      type: String,
      maxlength: 200,
      default: "",
    },
    phone: {
      type: String,
      maxlength: 20,
      default: "",
    },

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },

    // Privacy Settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
      showBirthday: {
        type: Boolean,
        default: true,
      },
      allowFriendRequests: {
        type: Boolean,
        default: true,
      },
      allowMessages: {
        type: Boolean,
        default: true,
      },
    },

    // Notification Settings
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      friendRequests: {
        type: Boolean,
        default: true,
      },
      messages: {
        type: Boolean,
        default: true,
      },
      likes: {
        type: Boolean,
        default: true,
      },
      comments: {
        type: Boolean,
        default: true,
      },
    },

    // Statistics (computed fields)
    stats: {
      friendsCount: {
        type: Number,
        default: 0,
      },
      postsCount: {
        type: Number,
        default: 0,
      },
      photosCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ firstName: 1, lastName: 1 });
UserSchema.index({ "privacy.profileVisibility": 1, isActive: 1 });

// Virtual Fields
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Custom validation
UserSchema.path("email").validate(function (value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}, "Email format is invalid");

UserSchema.path("username").validate(function (value) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(value);
}, "Username must be 3-30 characters and contain only letters, numbers, and underscores");

// Middleware - Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance Methods
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.updateLastSeen = function () {
  this.lastSeen = new Date();
  return this.save();
};

UserSchema.methods.incrementStats = function (field, increment = 1) {
  if (this.stats[field] !== undefined) {
    this.stats[field] += increment;
    return this.save();
  }
  throw new Error(`Invalid stats field: ${field}`);
};

UserSchema.methods.decrementStats = function (field, decrement = 1) {
  if (this.stats[field] !== undefined) {
    this.stats[field] = Math.max(0, this.stats[field] - decrement);
    return this.save();
  }
  throw new Error(`Invalid stats field: ${field}`);
};

// Static Methods
UserSchema.statics.findByUsernameOrEmail = function (identifier) {
  return this.findOne({
    $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
  });
};

UserSchema.statics.getUserWithPostCount = async function (userId) {
  const user = await this.findById(userId);
  if (!user) return null;

  // Count posts for this user
  const Post = mongoose.model("Post");
  const postsCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });

  // Return user with real-time post count without saving
  const userObj = user.toObject();
  userObj.stats.postsCount = postsCount;
  userObj.postsCount = postsCount;

  // Add id field for consistency with login/register responses
  userObj.id = userObj._id;

  return userObj;
};

UserSchema.statics.getFriendsCount = async function (userId) {
  const Friendship = mongoose.model("Friendship");
  const friendships = await Friendship.getFriends(userId);
  return friendships.length;
};

UserSchema.statics.calculateUserStats = async function (userId) {
  const Post = mongoose.model("Post");
  const Friendship = mongoose.model("Friendship");

  // Count posts
  const postsCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });

  // Count photos (posts with images)
  const photosCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
    images: { $exists: true, $ne: [] },
  });

  // Count videos (posts with videos)
  const videosCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
    videos: { $exists: true, $ne: [] },
  });

  // Count friends (real-time)
  const friendsCount = await Friendship.getFriends(userId).then(
    (f) => f.length
  );

  return {
    postsCount,
    photosCount,
    videosCount,
    friendsCount,
  };
};

UserSchema.statics.searchUsers = function (query, options = {}) {
  const { limit = 10, skip = 0, privacy = "public" } = options;

  const searchQuery = {
    $and: [
      {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { firstName: { $regex: query, $options: "i" } },
          { lastName: { $regex: query, $options: "i" } },
        ],
      },
      { isActive: true },
      { "privacy.profileVisibility": privacy },
    ],
  };

  return this.find(searchQuery)
    .select("username firstName lastName profilePicture bio title stats")
    .limit(limit)
    .skip(skip)
    .sort({ "stats.friendsCount": -1, username: 1 });
};

UserSchema.statics.getPublicProfile = function (
  userId,
  requestingUserId = null
) {
  const projection = {
    username: 1,
    firstName: 1,
    lastName: 1,
    profilePicture: 1,
    coverPhoto: 1,
    bio: 1,
    title: 1,
    location: 1,
    work: 1,
    education: 1,
    website: 1,
    isVerified: 1,
    lastSeen: 1,
    stats: 1,
    createdAt: 1,
  };

  // If requesting user is the same as profile owner, include more fields
  if (requestingUserId && requestingUserId.toString() === userId.toString()) {
    projection.email = 1;
    projection.phone = 1;
    projection.dateOfBirth = 1;
    projection.gender = 1;
    projection.privacy = 1;
    projection.notifications = 1;
  }

  return this.findById(userId).select(projection);
};

// Configure toJSON to include virtuals and exclude sensitive data
UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

// Configure toObject to include virtuals and exclude sensitive data
UserSchema.set("toObject", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
