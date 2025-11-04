import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"; // --- TAMBAHAN --- (Diperlukan untuk token)

const UserSchema = new mongoose.Schema(
  {
    // --- Informasi Dasar ---
    firstName: {
      type: String,
      trim: true,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Last name is required"],
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 6,
      select: false,
    },

    // --- Informasi Profil ---
    avatar: { type: String },
    coverPhoto: { type: String },
    bio: { type: String, trim: true, maxLength: 250 },
    details: {
      worksAt: { type: String, trim: true },
      livesIn: { type: String, trim: true },
      from: { type: String, trim: true },
      joined: { type: Date, default: Date.now },
      // --- TAMBAHAN ---
      relationshipStatus: {
        type: String,
        trim: true,
        enum: [
          "Single",
          "In a relationship",
          "Engaged",
          "Married",
          "It's complicated",
          "In an open relationship",
          "Widowed",
          "Separated",
          "Divorced",
        ],
      },
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    website: { type: String, trim: true },
    location: { type: String, trim: true },
    work: { type: String, trim: true },
    education: { type: String, trim: true },

    // --- Status Akun ---
    isVerified: { type: Boolean, default: false }, // Verifikasi email
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },

    // --- Keamanan & Token --- (TAMBAHAN)
    verificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // --- Relasi Sosial ---
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // --- TAMBAHAN ---
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Ref ke Model 'Post'

    // --- Privasi ---
    privacy: {
      showProfile: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      // --- TAMBAHAN --- (Kontrol lebih detail)
      whoCanSeeFriendsList: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      whoCanSendFriendRequest: {
        type: String,
        enum: ["everyone", "friends_of_friends"],
        default: "everyone",
      },
      whoCanSeePhone: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "friends",
      },
      whoCanSeeDOB: {
        type: String,
        enum: ["public", "friends", "private", "only_month_day"],
        default: "friends",
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
    },

    /*
    --- Catatan tentang Notifikasi ---
    Menyimpan notifikasi sebagai array di dalam User schema bisa menjadi tidak efisien
    jika jumlah notifikasi sangat besar (unbounded array).
    Praktik yang lebih baik (scalable) adalah membuat Model/Schema terpisah:
    
    const NotificationSchema = new mongoose.Schema({
      recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['like', 'comment', 'friend_request'], required: true },
      targetPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      read: { type: Boolean, default: false },
    }, { timestamps: true });
    
    Lalu Anda bisa query: Notification.find({ recipient: userId, read: false })
    */
  },
  {
    // --- Opsi Skema ---
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- 1. VIRTUAL PROPERTY ---
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual("friendsCount").get(function () {
  // Ini akan secara otomatis menghitung jumlah teman
  return this.friends?.length;
});

// --- 2. MIDDLEWARE (pre-save hook) ---
UserSchema.pre("save", async function (next) {
  // Hanya hash password jika telah dimodifikasi (atau baru)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- 3. INSTANCE METHOD (Compare Password) ---
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// --- 4. INSTANCE METHOD (Create Reset Token) --- (TAMBAHAN)
UserSchema.methods.createPasswordResetToken = function () {
  // 1. Buat token mentah
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash token tersebut dan simpan di database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Set waktu kedaluwarsa (misal, 10 menit)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // 4. Kembalikan token mentah (untuk dikirim via email)
  return resetToken;
};

// --- 5. INSTANCE METHOD (Create Verification Token) --- (TAMBAHAN)
UserSchema.methods.createVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Anda mungkin juga ingin menambahkan expiry time di sini
  // this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 jam

  return verificationToken;
};

// --- 6. STATIC METHOD (Search) ---
UserSchema.statics.searchUsers = function (query, limit = 10, skip = 0) {
  const searchRegex = new RegExp(query, "i");

  return this.find({
    $or: [
      { username: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
    ],
    isActive: true,
  })
    .select("username firstName lastName avatar bio")
    .limit(limit)
    .skip(skip)
    .sort({ username: 1 });
};

// --- 7. STATIC METHOD (Get Profile) ---
UserSchema.statics.getPublicProfile = function (
  userId,
  requestingUserId = null
) {
  const projection = {
    username: 1,
    firstName: 1,
    lastName: 1,
    avatar: 1,
    coverPhoto: 1,
    bio: 1,
    details: 1,
    location: 1,
    work: 1,
    education: 1,
    website: 1,
    isVerified: 1,
    lastSeen: 1,
    createdAt: 1,
    fullName: 1,
    friends: 1,
    // Kita tidak menyertakan 'privacy' di sini secara default
  };

  if (requestingUserId && requestingUserId.toString() === userId.toString()) {
    // Pemilik profil melihat semuanya
    projection.email = 1;
    projection.phone = 1;
    projection.dateOfBirth = 1;
    projection.gender = 1;
    projection.privacy = 1;
    projection.savedPosts = 1; // Pemilik bisa lihat postingan tersimpan
    projection.blockedUsers = 1; // Pemilik bisa lihat daftar blokir
  }

  // Logika untuk 'friends' atau 'public' akan lebih kompleks
  // Anda perlu mengambil data user dulu, lalu cek 'privacy' object-nya
  // Tapi untuk 'getById', ini sudah cukup.
  // Logika privasi (misal, 'friends' bisa lihat apa)
  // sebaiknya ditangani di level service/controller setelah data diambil.

  return this.findById(userId)
    .select(projection)
    .populate({
      path: "friends",
      select: "username fullName avatar",
      options: { limit: 6 }, // <-- BATASI HANYA 6 TEMAN
    });
};

// --- 8. Transformasi toJSON ---
UserSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    // Hapus juga token dari output JSON
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.verificationToken;
    return ret;
  },
});

const User = mongoose.model("User", UserSchema);
export default User;
