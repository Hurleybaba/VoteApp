import pool from "../database.js";
import bcrypt from "bcrypt";
import generateToken from "../Utils/generateToken.js";
import { sendOtpEmail } from "../sendMail.js";
import axios from "axios";

// Temporary in-memory storage (use database in production)
const otpStorage = new Map();

export const registerUser = async (req, res) => {
  try {
    const {
      firstname,
      middlename,
      lastname,
      username,
      age,
      email,
      phone,
      password,
    } = req.body;

    // Check if the user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUser[0].length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    //if number is already in use
    const existingNumber = await pool.query(
      "SELECT * FROM users WHERE phone = ?",
      [phone]
    );
    if (existingNumber[0].length > 0) {
      return res.status(400).json({ message: "Number already in use" });
    }

    if (!phone || phone.length !== 11) {
      return res
        .status(400)
        .json({ message: "Phone number must be exactly 11 digits" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const [result] = await pool.query(
      "INSERT INTO users (first_name, middle_name, last_name, username, age, email, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        firstname,
        middlename,
        lastname,
        username,
        age,
        email,
        phone,
        hashedPassword,
      ]
    );

    const userId = result.insertId;

    if (!userId) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    const token = generateToken(userId);

    // Send the data and token back to the client
    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        firstname,
        middlename,
        lastname,
        username,
        age,
        email,
        phone,
      },
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const [user] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user[0].userid);

    // Send the data and token back to the client
    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user[0].userid,
        firstname: user[0].first_name,
        middlename: user[0].middle_name,
        lastname: user[0].last_name,
        username: user[0].user_name,
        age: user[0].age,
        email: user[0].email,
        phone: user[0].phone,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {};

export const sendEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
    console.log(`Generating OTP for email: ${email}`);
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
    console.log(`Generated OTP: ${otp}`);

    // Store OTP (in production, use a database)
    otpStorage.set(email, { otp, expiresAt, attempts: 0 });

    await sendOtpEmail(email, otp);
    res.json({ success: true, message: "OTP sent" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to send OTP from the backend" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "OTP must be 6 digits",
    });
  }

  try {
    const storedOtpData = otpStorage.get(email);

    if (!storedOtpData) {
      console.warn(`OTP not found for email: ${email}`);
      return res
        .status(404)
        .json({ success: false, message: "OTP invalid or expired" });
    }

    const { otp: storedOtp, expiresAt, attempts = 0 } = storedOtpData;

    if (attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    const isOtpValid = storedOtp.toString() === otp.toString();
    const isExpired = Date.now() > new Date(expiresAt).getTime();

    if (!isOtpValid || isExpired) {
      // Update attempt count
      otpStorage.set(email, {
        ...storedOtpData,
        attempts: attempts + 1,
      });

      return res.status(401).json({
        success: false,
        message: isExpired ? "OTP expired" : "Invalid OTP",
      });
    }

    otpStorage.delete(email); // Clear OTP after successful verification
    console.log(`OTP verified for email: ${email}`);

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from the token in the middleware
    console.log("userId", userId);

    if (!userId) {
      return res.status(401).json({ message: "No user ID found" });
    }

    // Query the user by userId
    const [user] = await pool.query("SELECT * FROM users WHERE userid = ?", [
      userId,
    ]);

    // Check if the user exists
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data
    console.log("user", user);
    return res.status(200).json(user[0]); // Return the first user (since user is an array)
  } catch (error) {
    console.error("Error in getUser:", error);
    return res
      .status(500)
      .json({ message: "Internal server error on getUser" });
  }
};
