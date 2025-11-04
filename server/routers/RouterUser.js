import { Router } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../schema/UserSchema.js";
import { sendActivationEmail } from "../utils/EmailActivation.js";
import { verify } from "../middlewares/Verify.js";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import Post from "../schema/PostSchema.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.memoryStorage(); // Simpan file di memori sementara
const upload = multer({ storage: storage });

// Endpoint untuk mengunggah avatar dan foto sampul
router.post(
  "/upload-profile-images",
  verify(),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { _id } = req.user;
      const user = await User.findById(_id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const uploadPath = path.join(
        __dirname,
        "..",
        "assets",
        "profiles",
        _id.toString()
      );
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Proses dan simpan avatar jika ada
      if (req.files.avatar) {
        const avatar = req.files.avatar[0];
        const avatarFileName = `avatar-${Date.now()}.jpeg`;
        const avatarPath = path.join(uploadPath, avatarFileName);

        await sharp(avatar.buffer)
          .resize(200, 200)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(avatarPath);

        user.avatar = `/assets/profiles/${_id.toString()}/${avatarFileName}`;
      }

      // Proses dan simpan foto sampul jika ada
      if (req.files.cover) {
        const cover = req.files.cover[0];
        const coverFileName = `cover-${Date.now()}.jpeg`;
        const coverPath = path.join(uploadPath, coverFileName);

        await sharp(cover.buffer)
          .resize(851, 315)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(coverPath);

        user.coverPhoto = `/assets/profiles/${_id.toString()}/${coverFileName}`;
      }

      await user.save();

      res.status(200).json({
        message: "Profile images uploaded successfully",
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
      });
    } catch (error) {
      console.error("Error uploading profile images:", error);
      res.status(500).json({ message: "Error uploading images" });
    }
  }
);

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, dob, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    // 1. Buat user baru di memori (JANGAN .save() dulu)
    const newUser = new User({
      firstName,
      lastName,
      dob,
      email,
      password,
    });

    // 2. Buat token verifikasi (ini akan disimpan di objek newUser)
    const verificationToken = newUser.createVerificationToken();

    // 3. Coba kirim email AKTIVASI DULU
    await sendActivationEmail(
      newUser.email,
      newUser.firstName,
      verificationToken
    );

    // 4. JIKA email berhasil terkirim, BARU simpan user ke database
    await newUser.save();

    res.status(201).json({
      message:
        "Signup successful! Please check your inbox or spam to activate your account.",
    });
  } catch (error) {
    console.log(error);

    // Kirim response error yang lebih spesifik jika ini error email
    if (error.code === "EAUTH" || error.command === "AUTH PLAIN") {
      return res.status(500).json({
        message: "Email service failed to authenticate. User not created.",
      });
    }

    res.status(500).json({
      message: "Failed to create user. Please try again later.",
      error: error.message,
    });
  }
});

// User Signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Signin successful!",
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Activate Account
router.post("/activate", async (req, res) => {
  try {
    const { activationCode, username, gender } = req.query;

    // Hash the incoming token so we can match it to the hashed version in the DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(activationCode)
      .digest("hex");

    const user = await User.findOne({ verificationToken: hashedToken });

    if (!user) {
      return res.status(400).json({ message: "Invalid activation code." });
    }

    user.username = username;
    user.gender = gender;
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Account activated successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Load User
router.get("/load", verify(), async (req, res) => {
  try {
    const { _id } = req.user;

    const user = await User.findOne({ _id }).select(
      "username firstName lastName avatar email phone privacy"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      privacy: user.privacy,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
});

router.get("/profile/:username", verify(), async (req, res) => {
  try {
    // 1. Identifikasi siapa yang meminta (requestingUser)
    const requestingUserId = req.user ? req.user._id : null;

    // 2. Temukan user yang profilnya ingin dilihat (profileUser)
    const { username } = req.params;
    const profileUser = await User.findOne({
      username: username.toLowerCase(),
    }).select("privacy friends"); // Ambil setelan privasi dan daftar teman

    if (!profileUser) {
      return res.status(404).json({ message: "User profile not found." });
    }

    // 3. Cek relasi antara requestingUser dan profileUser
    const isOwner =
      requestingUserId && requestingUserId.equals(profileUser._id);

    // Cek apakah requestingUser (jika ada) ada di daftar teman profileUser
    const isFriend =
      !isOwner &&
      requestingUserId &&
      profileUser.friends.some((friendId) => friendId.equals(requestingUserId));

    // 4. Terapkan aturan privasi utama (dari UserSchema.js)
    const privacySetting = profileUser.privacy.showProfile;

    // KASUS 1: Profil privat dan Anda bukan pemilik
    if (privacySetting === "private" && !isOwner) {
      return res.status(403).json({ message: "This profile is private." });
    }

    // KASUS 2: Profil 'friends' dan Anda bukan pemilik ATAU teman
    if (privacySetting === "friends" && !isOwner && !isFriend) {
      // Kita kembalikan data minimal (bukan error 403)
      // agar frontend bisa menampilkan info dasar (foto, nama)
      const minimalProfile = await User.findById(profileUser._id).select(
        "username firstName lastName avatar"
      );
      return res.status(200).json({
        message: "This profile is only visible to friends.",
        profile: minimalProfile,
        access: "limited", // Flag untuk frontend
      });
    }

    // KASUS 3: Lolos (Profil publik, ATAU Anda teman, ATAU Anda pemilik)
    // Panggil static method 'getPublicProfile' untuk mengambil data
    // yang sudah difilter (sesuai logika di UserSchema.js)
    const userProfile = await User.getPublicProfile(
      profileUser._id,
      requestingUserId
    );

    if (!userProfile) {
      return res
        .status(404)
        .json({ message: "User profile could not be loaded." });
    }

    // 'getPublicProfile' di UserSchema.js sudah menangani
    // data apa yang harus dikembalikan jika 'isOwner' vs bukan.
    // Kita bisa tambahkan status relasi untuk kemudahan frontend.
    const finalProfile = userProfile.toObject(); // Konversi ke plain object
    finalProfile.isFriend = isFriend;
    finalProfile.isOwner = isOwner;
    finalProfile.access = "full"; // Flag untuk frontend

    // Ambil 6 postingan terbaru yang memiliki gambar
    const photos = await Post.find({
      user: profileUser._id,
      "media.type": "image",
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("media");

    finalProfile.photos = photos
      .flatMap((post) => post.media.filter((item) => item.type === "image"))
      .slice(0, 6);

    res.status(200).json(finalProfile);
  } catch (error) {
    console.log("Error fetching profile:", error);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
});

// Endpoint untuk memperbarui pengaturan umum
router.put("/settings/general", verify(), async (req, res) => {
  try {
    const { _id } = req.user;
    const { firstName, lastName, username } = req.body;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.username = username || user.username;

    await user.save();

    res.status(200).json({
      message: "General settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating general settings:", error);
    res.status(500).json({ message: "Error updating general settings" });
  }
});

// Endpoint untuk memperbarui pengaturan privasi
router.put("/settings/privacy", verify(), async (req, res) => {
  try {
    const { _id } = req.user;
    const privacySettings = req.body;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update seluruh objek privasi
    user.privacy = { ...user.privacy, ...privacySettings };

    await user.save();

    res.status(200).json({
      message: "Privacy settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    res.status(500).json({ message: "Error updating privacy settings" });
  }
});

router.put("/settings/details", verify(), async (req, res) => {
  try {
    const { _id } = req.user;
    const { bio, worksAt, livesIn, from, relationshipStatus } = req.body;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bio = bio || user.bio;
    user.details.worksAt = worksAt || user.details.worksAt;
    user.details.livesIn = livesIn || user.details.livesIn;
    user.details.from = from || user.details.from;
    user.details.relationshipStatus =
      relationshipStatus || user.details.relationshipStatus;

    await user.save();

    res.status(200).json({
      message: "Details updated successfully",
    });
  } catch (error) {
    console.error("Error updating details:", error);
    res.status(500).json({ message: "Error updating details" });
  }
});

router.get("/my-photos", verify(), async (req, res) => {
  try {
    const result = await Post.find({
      user: req.user.id,
      "media.type": "image",
    })
      .sort({ createdAt: -1 })
      .select("media");

    const photos = result.flatMap((post) =>
      post.media.filter((item) => item.type === "image")
    );

    res.status(200).json(photos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
