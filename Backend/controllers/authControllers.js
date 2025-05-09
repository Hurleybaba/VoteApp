import pool from "../database.js";
import bcrypt from "bcrypt";
import generateToken from "../Utils/generateToken.js";
import axios from "axios";

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
      "INSERT INTO users (firstname, middlename, lastname, username, age, email, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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
        firstname: user[0].firstname,
        middlename: user[0].middlename,
        lastname: user[0].lastname,
        username: user[0].username,
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

export const sendOTP = async (req, res) => {
  const TERMII_API_KEY = process.env.TERMII_API_KEY;
  const { number } = req.body;

  // Validate phone number format
  if (!number || !/^\+?\d{10,15}$/.test(number)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  try {
    const response = await axios.post(
      "https://api.ng.termii.com/api/sms/otp/send",
      {
        api_key: TERMII_API_KEY,
        message_type: "NUMERIC",
        to: number,
        from: "VerifySMS", // Changed to your app name
        channel: "generic",
        pin_attempts: 5,
        pin_time_to_live: 5, // 5 minutes
        pin_length: 6, // Increased to 6 digits for better security
        pin_placeholder: "< 123456 >",
        message_text: "Your UniVOTE verification code is < 123456 >",
        pin_type: "NUMERIC",
      },
      {
        timeout: 10000, // 10 second timeout
      }
    );

    console.log("OTP sent to:", number);

    if (response.data?.status === "success") {
      return res.status(200).json({
        message: "OTP sent successfully",
        pinId: response.data.pinId, // send the pinID for security
      });
    } else {
      console.error("Termii API error:", response.data);
      return res.status(502).json({ message: "OTP service unavailable" });
    }
  } catch (error) {
    console.error("OTP send error:", error.message);
    return res.status(500).json({
      message: "Failed to send OTP",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const verifyOTP = async (req, res) => {
  const TERMII_API_KEY = process.env.TERMII_API_KEY;
  const { pinId, otp } = req.body;

  try {
    const response = await axios.post(
      "https://api.ng.termii.com/api/sms/otp/verify",
      {
        api_key: TERMII_API_KEY,
        pin_id: pinId,
        pin: otp,
      },
      {
        timeout: 5000,
      }
    );

    if (response.data?.verified === true) {
      console.log("OTP verified for pinId:", pinId);
      return res.status(200).json({
        message: "OTP verified successfully",
        verified: true,
      });
    } else {
      return res.status(401).json({
        message: "Invalid OTP",
        attemptsLeft: response.data?.attempts_remaining || 0,
      });
    }
  } catch (error) {
    console.error(
      "OTP verification error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 400) {
      return res.status(400).json({
        message: "Invalid OTP or expired",
        details: error.response.data?.message,
      });
    }

    return res.status(500).json({
      message: "OTP verification failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
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
