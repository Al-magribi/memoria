# MongoDB Schema untuk Aplikasi Memoria

## 1. User Schema

```javascript
const userSchema = new mongoose.Schema(
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
      default: null,
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
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ firstName: 1, lastName: 1 });
```

## 2. Post Schema

```javascript
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Content
    content: {
      type: String,
      required: true,
      trim: true,
    },

    // Media - Simplified structure to match frontend usage
    image: {
      type: String, // URL to image
    },
    video: {
      type: String, // URL to video
    },

    // Privacy
    privacy: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },

    // Tags
    taggedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Location
    location: {
      name: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },

    // Engagement - Simplified to match frontend structure
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Comments - Embedded for better performance with nested replies
    comments: [
      {
        id: {
          type: Number,
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: 1000,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        author: {
          id: {
            type: Number,
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          profilePicture: {
            type: String,
            required: true,
          },
        },
        likes: {
          type: Number,
          default: 0,
        },
        likedBy: [
          {
            type: Number, // User ID
          },
        ],
        replies: [
          {
            id: {
              type: Number,
              required: true,
            },
            content: {
              type: String,
              required: true,
              maxlength: 1000,
              trim: true,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
            author: {
              id: {
                type: Number,
                required: true,
              },
              name: {
                type: String,
                required: true,
              },
              profilePicture: {
                type: String,
                required: true,
              },
            },
            likes: {
              type: Number,
              default: 0,
            },
            likedBy: [
              {
                type: Number, // User ID
              },
            ],
            replies: [], // Nested replies (max 2 levels deep)
          },
        ],
      },
    ],

    // Status
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ privacy: 1, createdAt: -1 });
postSchema.index({ "likes.user": 1 });
postSchema.index({ "comments.author.id": 1 });
```

## 3. Comment Schema (Alternative - Separate Collection)

```javascript
const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },

    // Media in comments
    media: {
      type: {
        type: String,
        enum: ["image", "video"],
      },
      url: String,
      filename: String,
      size: Number,
      mimeType: String,
    },

    // Reply functionality - Nested structure to match frontend
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },

    // Engagement - Simplified to match frontend
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Status
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ likedBy: 1 });
```

## 4. Story Schema

```javascript
const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Media
    media: {
      type: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
    },

    // Content
    caption: {
      type: String,
      maxlength: 200,
      trim: true,
    },

    // Privacy
    privacy: {
      type: String,
      enum: ["public", "friends", "close_friends"],
      default: "friends",
    },

    // Views
    views: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ isActive: 1, createdAt: -1 });
storySchema.index({ "views.user": 1 });
```

## 5. Friendship Schema

```javascript
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
```

## 6. Message Schema

```javascript
const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },

    // Media in messages
    media: {
      type: {
        type: String,
        enum: ["image", "video", "audio", "file"],
      },
      url: String,
      filename: String,
      size: Number,
      mimeType: String,
    },

    // Message status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },

    // Message type
    type: {
      type: String,
      enum: ["text", "media", "system"],
      default: "text",
    },

    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // Status
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });
```

## 7. Conversation Schema

```javascript
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Conversation info
    name: {
      type: String,
      maxlength: 100,
      trim: true,
    },

    // Group chat settings
    isGroup: {
      type: Boolean,
      default: false,
    },

    // Group chat specific fields
    groupInfo: {
      avatar: String,
      description: {
        type: String,
        maxlength: 500,
      },
      admins: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    // Last message info
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
    },

    // Unread counts for each participant
    unreadCounts: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ isGroup: 1 });
```

## 8. Notification Schema

```javascript
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
```

## 9. Media Schema (untuk file upload)

```javascript
const mediaSchema = new mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // File information
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },

    // Storage information
    url: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },

    // Media type
    type: {
      type: String,
      enum: ["image", "video", "audio", "file"],
      required: true,
    },

    // Image specific fields
    imageInfo: {
      width: Number,
      height: Number,
      format: String,
    },

    // Video specific fields
    videoInfo: {
      duration: Number,
      width: Number,
      height: Number,
      format: String,
    },

    // Usage tracking
    usage: {
      posts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
      ],
      stories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Story",
        },
      ],
      comments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
        },
      ],
      messages: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
      ],
    },

    // Status
    isPublic: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mediaSchema.index({ uploader: 1, createdAt: -1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ mimeType: 1 });
```

## 10. User Session Schema

```javascript
const userSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Session information
    token: {
      type: String,
      required: true,
      unique: true,
    },

    // Device information
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      deviceType: {
        type: String,
        enum: ["desktop", "mobile", "tablet"],
      },
      browser: String,
      os: String,
    },

    // Location
    location: {
      country: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Expiration
    expiresAt: {
      type: Date,
      required: true,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSessionSchema.index({ user: 1 });
userSessionSchema.index({ token: 1 });
userSessionSchema.index({ expiresAt: 1 });
userSessionSchema.index({ isActive: 1 });
```

## 11. Report Schema

```javascript
const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reported content
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    reportedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    reportedStory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },

    // Report details
    reason: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "hate_speech",
        "violence",
        "fake_news",
        "copyright",
        "inappropriate_content",
        "other",
      ],
      required: true,
    },

    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },

    // Admin notes
    adminNotes: {
      type: String,
      maxlength: 1000,
    },

    // Resolution
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
    action: {
      type: String,
      enum: [
        "warning",
        "content_removal",
        "account_suspension",
        "account_ban",
        "none",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ reportedPost: 1 });
```

## 12. Analytics Schema

```javascript
const analyticsSchema = new mongoose.Schema(
  {
    // User analytics
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Post analytics
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },

    // Story analytics
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },

    // Event type
    eventType: {
      type: String,
      enum: [
        "post_view",
        "post_like",
        "post_share",
        "post_comment",
        "story_view",
        "story_reply",
        "profile_view",
        "friend_request",
        "message_sent",
        "login",
        "logout",
      ],
      required: true,
    },

    // Event data
    eventData: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Device and location
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      deviceType: String,
      browser: String,
      os: String,
    },

    location: {
      country: String,
      city: String,
      coordinates: [Number],
    },

    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ post: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });
```

## Implementasi dan Penggunaan

### 1. Virtual Fields dan Methods

```javascript
// User Schema - Virtual untuk full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Post Schema - Virtual untuk like count
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Post Schema - Virtual untuk comment count
postSchema.virtual("commentCount").get(function () {
  return this.comments ? this.comments.length : 0;
});

// Post Schema - Virtual untuk total replies count
postSchema.virtual("totalRepliesCount").get(function () {
  if (!this.comments) return 0;
  return this.comments.reduce((total, comment) => {
    return total + (comment.replies ? comment.replies.length : 0);
  }, 0);
});

// Comment Schema - Virtual untuk isLiked by specific user
commentSchema.virtual("isLikedBy").get(function (userId) {
  return this.likedBy.includes(userId);
});
```

### 2. Middleware

```javascript
// User Schema - Hash password sebelum save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Post Schema - Update user stats setelah post
postSchema.post("save", async function (doc) {
  if (doc.isDeleted) return;

  const User = mongoose.model("User");
  await User.findByIdAndUpdate(doc.author, {
    $inc: { "stats.postsCount": 1 },
  });
});

// Post Schema - Auto-generate comment ID
postSchema.pre("save", function (next) {
  if (this.isModified("comments")) {
    this.comments.forEach((comment, index) => {
      if (!comment.id) {
        comment.id = Date.now() + index; // Generate unique ID
      }
      if (comment.replies) {
        comment.replies.forEach((reply, replyIndex) => {
          if (!reply.id) {
            reply.id = Date.now() + index + replyIndex + 1000; // Generate unique ID for replies
          }
        });
      }
    });
  }
  next();
});
```

### 3. Instance Methods untuk Post

```javascript
// Post Schema - Method untuk menambah komentar
postSchema.methods.addComment = function (commentData) {
  const newComment = {
    id: Date.now() + Math.random(),
    content: commentData.content,
    createdAt: new Date(),
    author: {
      id: commentData.author.id,
      name: commentData.author.name,
      profilePicture: commentData.author.profilePicture,
    },
    likes: 0,
    likedBy: [],
    replies: [],
  };

  this.comments.push(newComment);
  return this.save();
};

// Post Schema - Method untuk menambah reply
postSchema.methods.addReply = function (commentId, replyData) {
  const addReplyToComment = (comments) => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        const newReply = {
          id: Date.now() + Math.random(),
          content: replyData.content,
          createdAt: new Date(),
          author: {
            id: replyData.author.id,
            name: replyData.author.name,
            profilePicture: replyData.author.profilePicture,
          },
          likes: 0,
          likedBy: [],
          replies: [],
        };
        comment.replies.push(newReply);
      } else if (comment.replies) {
        comment.replies = addReplyToComment(comment.replies);
      }
      return comment;
    });
  };

  this.comments = addReplyToComment(this.comments);
  return this.save();
};

// Post Schema - Method untuk like/unlike komentar
postSchema.methods.toggleCommentLike = function (commentId, userId) {
  const toggleLikeInComments = (comments) => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        const isLiked = comment.likedBy.includes(userId);
        if (isLiked) {
          comment.likes = Math.max(0, comment.likes - 1);
          comment.likedBy = comment.likedBy.filter((id) => id !== userId);
        } else {
          comment.likes += 1;
          comment.likedBy.push(userId);
        }
      } else if (comment.replies) {
        comment.replies = toggleLikeInComments(comment.replies);
      }
      return comment;
    });
  };

  this.comments = toggleLikeInComments(this.comments);
  return this.save();
};

// Post Schema - Method untuk hapus komentar
postSchema.methods.deleteComment = function (commentId) {
  const deleteCommentFromComments = (comments) => {
    return comments.filter((comment) => {
      if (comment.id === commentId) {
        return false; // Remove this comment
      }
      if (comment.replies) {
        comment.replies = deleteCommentFromComments(comment.replies);
      }
      return true;
    });
  };

  this.comments = deleteCommentFromComments(this.comments);
  return this.save();
};
```

### 4. Static Methods untuk Query

```javascript
// Post Schema - Static method untuk mendapatkan post dengan komentar
postSchema.statics.getPostWithComments = function (postId, userId) {
  return this.findById(postId)
    .populate("author", "firstName lastName profilePicture")
    .lean()
    .then((post) => {
      if (!post) return null;

      // Add isLiked property to comments and replies
      const addIsLikedToComments = (comments) => {
        return comments.map((comment) => ({
          ...comment,
          isLiked: comment.likedBy.includes(userId),
          replies: comment.replies ? addIsLikedToComments(comment.replies) : [],
        }));
      };

      post.comments = addIsLikedToComments(post.comments);
      return post;
    });
};

// Post Schema - Static method untuk mendapatkan feed posts
postSchema.statics.getFeedPosts = function (userId, page = 1, limit = 10) {
  return this.find({
    privacy: { $in: ["public", "friends"] },
    isDeleted: false,
  })
    .populate("author", "firstName lastName profilePicture")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .then((posts) => {
      return posts.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => ({
          ...comment,
          isLiked: comment.likedBy.includes(userId),
          replies: comment.replies.map((reply) => ({
            ...reply,
            isLiked: reply.likedBy.includes(userId),
          })),
        })),
      }));
    });
};
```

### 5. Indexes untuk Performance

```javascript
// Compound indexes untuk query yang sering digunakan
userSchema.index({ "privacy.profileVisibility": 1, isActive: 1 });
postSchema.index({ author: 1, privacy: 1, createdAt: -1 });
postSchema.index({ "comments.author.id": 1, createdAt: -1 });
postSchema.index({ "comments.likedBy": 1 });
postSchema.index({ "comments.replies.likedBy": 1 });
```

### 6. Validation

```javascript
// Custom validation untuk email
userSchema.path("email").validate(function (value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}, "Email format is invalid");

// Custom validation untuk username
userSchema.path("username").validate(function (value) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(value);
}, "Username must be 3-30 characters and contain only letters, numbers, and underscores");

// Custom validation untuk comment content
postSchema
  .path("comments")
  .schema.path("content")
  .validate(function (value) {
    return value && value.trim().length > 0 && value.length <= 1000;
  }, "Comment content must be between 1 and 1000 characters");

// Custom validation untuk reply content
postSchema
  .path("comments.replies")
  .schema.path("content")
  .validate(function (value) {
    return value && value.trim().length > 0 && value.length <= 1000;
  }, "Reply content must be between 1 and 1000 characters");
```

### 7. Contoh Penggunaan dalam API

```javascript
// API Route untuk menambah komentar
app.post("/api/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // From authentication middleware

    const user = await User.findById(userId);
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentData = {
      content,
      author: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        profilePicture: user.profilePicture,
      },
    };

    await post.addComment(commentData);

    res.status(201).json({
      message: "Comment added successfully",
      comment: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
});

// API Route untuk menambah reply
app.post("/api/posts/:postId/comments/:commentId/replies", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const replyData = {
      content,
      author: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        profilePicture: user.profilePicture,
      },
    };

    await post.addReply(parseInt(commentId), replyData);

    res.status(201).json({
      message: "Reply added successfully",
      reply: post.comments
        .find((c) => c.id === parseInt(commentId))
        .replies.slice(-1)[0],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding reply", error: error.message });
  }
});

// API Route untuk like/unlike komentar
app.post("/api/posts/:postId/comments/:commentId/like", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await post.toggleCommentLike(parseInt(commentId), userId);

    res.json({ message: "Comment like toggled successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling like", error: error.message });
  }
});
```

Schema ini sekarang sudah disesuaikan dengan struktur data yang digunakan dalam komponen React dan mendukung semua fitur yang ada dalam aplikasi Memoria, termasuk sistem komentar nested dengan replies, like/unlike, dan operasi CRUD yang lengkap.

## Perbandingan Pendekatan: Embedded vs Separate Collection

### 1. Embedded Comments (Rekomendasi untuk Memoria)

**Keuntungan:**

- Performa query lebih cepat (tidak perlu join)
- Atomic operations untuk komentar dan post
- Struktur data yang sederhana dan mudah dipahami
- Sesuai dengan pola data yang sudah digunakan di frontend
- Mudah untuk pagination dan sorting

**Kekurangan:**

- Ukuran dokumen post bisa besar jika banyak komentar
- Batasan ukuran dokumen MongoDB (16MB)
- Sulit untuk query komentar secara terpisah

**Kapan digunakan:**

- Aplikasi dengan jumlah komentar per post yang tidak terlalu besar (< 1000)
- Ketika komentar selalu diakses bersama dengan post
- Untuk aplikasi sosial media dengan engagement yang moderat

### 2. Separate Collection (Alternatif)

**Keuntungan:**

- Skalabilitas yang lebih baik untuk komentar dalam jumlah besar
- Query komentar yang lebih fleksibel
- Tidak ada batasan ukuran dokumen
- Mudah untuk analytics dan reporting

**Kekurangan:**

- Perlu join untuk mendapatkan komentar dengan post
- Kompleksitas query yang lebih tinggi
- Potensi inkonsistensi data

**Kapan digunakan:**

- Aplikasi dengan jumlah komentar per post yang sangat besar (> 1000)
- Ketika komentar perlu diquery secara terpisah
- Untuk aplikasi dengan fitur analytics yang kompleks

### 3. Implementasi Hybrid (Opsional)

```javascript
// Post Schema dengan referensi ke komentar terbaru
const postSchema = new mongoose.Schema({
  // ... other fields

  // Embedded comments untuk komentar terbaru (misal: 50 terakhir)
  recentComments: [
    {
      id: Number,
      content: String,
      createdAt: Date,
      author: {
        id: Number,
        name: String,
        profilePicture: String,
      },
      likes: Number,
      likedBy: [Number],
      replies: [
        /* nested replies */
      ],
    },
  ],

  // Referensi ke komentar lama (jika ada)
  olderComments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],

  // Metadata komentar
  commentStats: {
    totalCount: { type: Number, default: 0 },
    lastCommentAt: Date,
  },
});
```

### 4. Rekomendasi untuk Memoria

Berdasarkan analisis komponen yang ada, **pendekatan embedded comments** direkomendasikan karena:

1. **Struktur data yang konsisten** dengan frontend
2. **Performa yang baik** untuk aplikasi sosial media
3. **Implementasi yang sederhana** dan mudah dipahami
4. **Atomic operations** untuk komentar dan post
5. **Mendukung nested replies** dengan baik

Jika aplikasi berkembang dan memerlukan skalabilitas yang lebih tinggi, dapat dipertimbangkan untuk migrasi ke pendekatan hybrid atau separate collection.
