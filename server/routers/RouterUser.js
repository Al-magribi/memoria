import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../schema/UserSchema.js";
import { sendActivationEmail } from "../utils/EmailActivation.js";

const router = Router();

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
    console.log(error); // Akan menampilkan error (termasuk error EAUTH jika belum diperbaiki)

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

    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      message: "Signin successful!",
      user: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Activate Account
router.get("/activate/:activationCode", async (req, res) => {
  try {
    const { activationCode } = req.params;

    // Hash the activation code to match the one in the database
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

export default router;
