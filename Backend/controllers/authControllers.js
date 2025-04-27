import pool from "../database.js";
import bcrypt from "bcrypt";
import generateToken from "../Utils/generateToken.js";

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

export const loginUser = async (req, res) => {};

export const logoutUser = async (req, res) => {};

export const getUser = async (req, res) => {
  try {
    const userId = req.userId; // Extracted from the token in the middleware
    const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user[0]);
  } catch (error) {
    console.error("Error in getUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
