import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../schema/UserSchema.js";
import { sendActivationEmail } from "../utils/EmailActivation.js";

const router = Router();

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, username, dob, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      username,
      dob,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Create a verification token
    const verificationToken = newUser.createVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    // Send activation email
    await sendActivationEmail(
      newUser.email,
      newUser.firstName,
      verificationToken
    );

    const { password: _, ...user } = newUser._doc;

    res.status(201).json({
      message: "Signup successful! Please check your email to activate your account.",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
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
