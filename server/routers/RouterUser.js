import { Router } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../schema/UserSchema.js";
import { sendActivationEmail } from "../utils/EmailActivation.js";
import { verify } from "../middlewares/Verify.js";
import multer from "multer";
import { compressImage } from "../utils/ImageCompress.js";
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

        await compressImage(avatar.buffer, avatarPath);

        user.avatar = `/assets/profiles/${_id.toString()}/${avatarFileName}`;
      }

      // Proses dan simpan foto sampul jika ada
      if (req.files.cover) {
        const cover = req.files.cover[0];
        const coverFileName = `cover-${Date.now()}.jpeg`;
        const coverPath = path.join(uploadPath, coverFileName);

        await compressImage(cover.buffer, coverPath);

        user.coverPhoto = `/assets/profiles/${_id.toString()}/${coverFileName}`;
      }

      await user.save();

      res.status(200).json({
        message: "Profile images uploaded successfully",
        user: {
          avatar: user.avatar,
          coverPhoto: user.coverPhoto,
        },
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
    const { firstName, lastName, gender, dob, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // 1. Buat user baru di memori (JANGAN .save() dulu)
    const newUser = new User({
      firstName,
      lastName,
      gender,
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

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages });
    }

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
    user.isLogin = true;

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Signin successful!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Activate Account
router.post("/activate", async (req, res) => {
  try {
    const { activationCode } = req.query;

    console.log(activationCode);

    // Hash the incoming token so we can match it to the hashed version in the DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(activationCode)
      .digest("hex");

    const user = await User.findOne({ verificationToken: hashedToken });

    if (!user) {
      return res.status(400).json({ message: "Invalid activation code." });
    }

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
      "fullName firstName lastName avatar email phone privacy"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
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

router.get("/profile/:fullName", verify(), async (req, res) => {
  try {
    // 1. Identifikasi siapa yang meminta (requestingUser)
    const requestingUserId = req.user ? req.user._id : null;

    // 2. Temukan user yang profilnya ingin dilihat (profileUser)
    const { fullName } = req.params;
    // Mengganti '.' menjadi spasi untuk mencocokkan format nama di database
    const searchFullName = fullName.replace(/\./g, " ");

    // Karena fullName adalah virtual, kita perlu mencari berdasarkan firstName dan lastName
    const nameParts = searchFullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    const profileUser = await User.findOne({
      firstName: new RegExp(`^${firstName}$`, "i"),
      lastName: new RegExp(`^${lastName}$`, "i"),
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
        "fullName firstName lastName avatar"
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
    const { firstName, lastName } = req.body;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }

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

router.post("/logout", verify(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("friends");

    user.isLogin = false;
    user.lastSeen = new Date();

    await user.save();

    user.friends.forEach(async (friendId) => {
      req.io.to(friendId.toString()).emit("status");
    });

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

const users = [
  {
    firstName: "Dimitry",
    lastName: "Prigmore",
    email: "dimitry@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Halli",
    lastName: "Ormshaw",
    email: "halli@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Averill",
    lastName: "De Caroli",
    email: "averill@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Gerick",
    lastName: "Purslow",
    email: "gerick@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Timmie",
    lastName: "Skippen",
    email: "timmie@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Wilmette",
    lastName: "Simister",
    email: "wilmette@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Branden",
    lastName: "Caltun",
    email: "branden@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Pammy",
    lastName: "Randales",
    email: "pammy@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Blaine",
    lastName: "Biggar",
    email: "blaine@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Gustave",
    lastName: "Tatton",
    email: "gustave@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Isiahi",
    lastName: "Hestrop",
    email: "isiahi@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Henrieta",
    lastName: "Asson",
    email: "henrieta@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Delmore",
    lastName: "Bricksey",
    email: "delmore@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Lena",
    lastName: "Waterstone",
    email: "lena@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Theodora",
    lastName: "Mashro",
    email: "theodora@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Blondelle",
    lastName: "Dagger",
    email: "blondelle@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Burg",
    lastName: "Biggin",
    email: "burg@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Conan",
    lastName: "Studde",
    email: "conan@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Thalia",
    lastName: "Spere",
    email: "thalia@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Fiann",
    lastName: "Reilingen",
    email: "fiann@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Shay",
    lastName: "Malafe",
    email: "shay@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Margeaux",
    lastName: "Hawtrey",
    email: "margeaux@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Caye",
    lastName: "Creboe",
    email: "caye@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Niven",
    lastName: "Aspel",
    email: "niven@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Adams",
    lastName: "Eckford",
    email: "adams@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Andy",
    lastName: "Piris",
    email: "andy@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Keefe",
    lastName: "Tieman",
    email: "keefe@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Raphaela",
    lastName: "Koba",
    email: "raphaela@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Owen",
    lastName: "Fadell",
    email: "owen@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Cariotta",
    lastName: "Osment",
    email: "cariotta@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Flore",
    lastName: "Abdey",
    email: "flore@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Harlan",
    lastName: "Cogin",
    email: "harlan@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Rockey",
    lastName: "Rawlin",
    email: "rockey@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Rozelle",
    lastName: "Rabbage",
    email: "rozelle@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Trefor",
    lastName: "Churly",
    email: "trefor@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Agnese",
    lastName: "Romanski",
    email: "agnese@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Gennie",
    lastName: "Wringe",
    email: "gennie@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Yehudit",
    lastName: "Pepperell",
    email: "yehudit@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Leigh",
    lastName: "Tassell",
    email: "leigh@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Lorain",
    lastName: "Deehan",
    email: "lorain@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Ram",
    lastName: "Strother",
    email: "ram@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Flossie",
    lastName: "Zamudio",
    email: "flossie@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Gunilla",
    lastName: "Clendinning",
    email: "gunilla@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Julieta",
    lastName: "Searby",
    email: "julieta@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Adara",
    lastName: "Buey",
    email: "adara@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Valerye",
    lastName: "Wade",
    email: "valerye@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Moira",
    lastName: "McQuillin",
    email: "moira@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Kirsti",
    lastName: "Strike",
    email: "kirsti@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Alameda",
    lastName: "Gurnay",
    email: "alameda@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Jamill",
    lastName: "Gilligan",
    email: "jamill@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Elise",
    lastName: "Bonsul",
    email: "elise@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Saxe",
    lastName: "Sunnucks",
    email: "saxe@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Goober",
    lastName: "Karle",
    email: "goober@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Micky",
    lastName: "Mallows",
    email: "micky@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Demetra",
    lastName: "Blazewicz",
    email: "demetra@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Annice",
    lastName: "Gittus",
    email: "annice@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Edvard",
    lastName: "Clother",
    email: "edvard@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Erv",
    lastName: "Staples",
    email: "erv@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Freddi",
    lastName: "Tupie",
    email: "freddi@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Johnathan",
    lastName: "Kolakowski",
    email: "johnathan@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Lancelot",
    lastName: "Ionnidis",
    email: "lancelot@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Shaine",
    lastName: "Overstall",
    email: "shaine@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Karena",
    lastName: "Glavin",
    email: "karena@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Conchita",
    lastName: "Gibbe",
    email: "conchita@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Stafani",
    lastName: "Smartman",
    email: "stafani@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Flory",
    lastName: "Hazeup",
    email: "flory@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Garnette",
    lastName: "Coppock.",
    email: "garnette@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Filberto",
    lastName: "Kittel",
    email: "filberto@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Glen",
    lastName: "Bruneton",
    email: "glen@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Smitty",
    lastName: "Gierck",
    email: "smitty@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Kirstin",
    lastName: "Camplin",
    email: "kirstin@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Norma",
    lastName: "Nelius",
    email: "norma@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Zandra",
    lastName: "Dagworthy",
    email: "zandra@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Bear",
    lastName: "Vasechkin",
    email: "bear@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Vicki",
    lastName: "Parlett",
    email: "vicki@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Remy",
    lastName: "Janney",
    email: "remy@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Klara",
    lastName: "Bedford",
    email: "klara@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Joane",
    lastName: "Kimmerling",
    email: "joane@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Kurtis",
    lastName: "Stetlye",
    email: "kurtis@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Maible",
    lastName: "Vargas",
    email: "maible@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Olva",
    lastName: "Matyas",
    email: "olva@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Frederic",
    lastName: "Silk",
    email: "frederic@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Darice",
    lastName: "Wrightam",
    email: "darice@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Carolee",
    lastName: "Lazar",
    email: "carolee@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Idaline",
    lastName: "Cattemull",
    email: "idaline@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Genna",
    lastName: "Hynam",
    email: "genna@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Edmon",
    lastName: "Treble",
    email: "edmon@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Teddy",
    lastName: "Duthie",
    email: "teddy@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Frankie",
    lastName: "Sconce",
    email: "frankie@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Stacie",
    lastName: "Bradburne",
    email: "stacie@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Phil",
    lastName: "Rudgerd",
    email: "phil@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Moe",
    lastName: "McMains",
    email: "moe@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Kelsey",
    lastName: "Quiddihy",
    email: "kelsey@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Rolf",
    lastName: "Bitten",
    email: "rolf@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Lexine",
    lastName: "Coushe",
    email: "lexine@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Candis",
    lastName: "Messager",
    email: "candis@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Augustus",
    lastName: "Stopforth",
    email: "augustus@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Vonny",
    lastName: "Riepl",
    email: "vonny@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Female",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Janessa",
    lastName: "Gumey",
    email: "janessa@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
  {
    firstName: "Heddie",
    lastName: "Blazeby",
    email: "heddie@gmail.com",
    password: "$2b$10$rPLHOxsH2uE4GqjW1KTcbu.cmuPh6ujOjEUnYdt.vH5bpQ77oR0p6",
    gender: "Male",
    dob: "1999-09-22T17:00:00.000+00:00",
    isVerified: "true",
    isActive: "true",
  },
];

router.post("/insert-users", async (req, res) => {
  try {
    // Menggunakan User.insertMany() untuk efisiensi
    const createdUsers = await User.insertMany(users, { ordered: false });
    res.status(201).json({
      message: `${createdUsers.length} users successfully inserted.`,
      data: createdUsers,
    });
  } catch (error) {
    // Jika ada error (misalnya duplikat email), sebagian data mungkin sudah masuk
    if (error.writeErrors) {
      const successfulInserts = error.insertedDocs?.length || 0;
      const failedCount = error.writeErrors.length;
      const errors = error.writeErrors.map((e) => e.err.errmsg);

      return res.status(207).json({
        message: `Process completed with mixed results: ${successfulInserts} users inserted, ${failedCount} failed.`,
        successCount: successfulInserts,
        failedCount: failedCount,
        errors: errors,
      });
    }

    console.error("Error inserting users:", error);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

export default router;
