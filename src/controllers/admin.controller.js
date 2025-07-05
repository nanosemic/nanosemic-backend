// controllers/adminController.js
import Admin from "../models/admin.model.js";
import Order from "../models/order.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Contact from "../models/contact.model.js";
import crypto from "crypto";
import sendEmailWithCode from "../utils/sendEmail.js";
import Address from "../models/address.model.js";
import path from "path";
import Otp from "../models/otp.model.js";

const signup = async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Signup request received:", { username, email });
  try {
    let existingUser = await Admin.findOne({ email });
    if (existingUser) {
      // if (existingUser) {
      return res.status(400).json({ message: "User already exists ." });
    } else {
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const otpRecord = new Otp({
        email,
        otp: verificationCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      });

      await otpRecord.save();
      await sendEmailWithCode(email, verificationCode);
      return res
        .status(200)
        .json({ message: "Verification code resent to your email." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup." });
  }
};

const verifyEmail = async (req, res) => {
  const { email, username, code, password } = req.body;

  try {
    if (!email || !username || !code || !password) {
      return res.status(400).json({
        message: "All fields (email, username, code, password) are required.",
      });
    }
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: "No OTP found for this email." });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired." });
    }
    if (otpRecord.otp !== code) {
      return res.status(400).json({ message: "Invalid OTP code." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Admin({
      username,
      email,
      password: hashedPassword,
      // code
    });

    await newUser.save();
    const accessToken = jwt.sign(
      { id: newUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id: newUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Logged in",
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    console.log(error);
  }
};

const logOut = async (req, res) => {
  try {
     res.clearCookie("access_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
     path: "/",
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
     path: "/",
  });
    res.json({ message: "Logged out" });
  } catch (error) {
    // next(error);
    console.log("Error during logout:", error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const accessToken = jwt.sign(
    { id: admin.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
  const refreshToken = jwt.sign(
    { id: admin.id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Logged in",
    username: admin.username,
    email: admin.email,
  });
};

const saveContact = async (req, res) => {
  const { email, name, mobile, message } = req.body;
  try {
    const newContact = new Contact({
      email,
      name,
      mobile,
      message,
    });
    await newContact.save();
    res.status(201).json("Contact saved successfully");
  } catch (error) {
    console.log("Error saving contact:", error);
    res.status(401).json("Error saving contact");
  }
};

const google = async (req, res) => {
  // res.json({message:"Google Auth not implemented in this version"});
  try {
    const validUser = await Admin.findOne({ email: req.body.email });
    if (validUser) {
      // const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
      // console.log(validUser._doc);
      const { password: pass, ...rest } = validUser._doc;
      const accessToken = jwt.sign(
        { id: validUser.id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      );
      const refreshToken = jwt.sign(
        { id: validUser.id },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
      const newUser = new Admin({
        username: 
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
      });
      await newUser.save();

      const { password: pass, ...rest } = newUser._doc;
      const accessToken = jwt.sign(
        { id: newUser.id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      );
      const refreshToken = jwt.sign(
        { id: newUser.id },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json(rest);
    }
  } catch (error) {
    // next(error);
    console.error("Google authentication error:", error);
  }
};

const profile = async (req, res) => {
  try {
    // const user = await Admin.findById(req.user.id);
    // if (!user) {
    //   return res.status(404).json({ message: "Admin not found" });
    // }
    // res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.status(201).json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Order.findByIdAndUpdate(id, { status });
  res.json({ msg: "Status updated" });
};

const getOrderStats = async (req, res) => {
  const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
  const stats = await Order.aggregate(pipeline);
  res.json(stats);
};
export default {
  signup,
  verifyEmail,
  login,
  profile,
  getOrders,
  logOut,
  updateOrderStatus,
  getOrderStats,
  google,
  saveContact,
};
