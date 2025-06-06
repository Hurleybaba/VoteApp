import pool from "../database.js";

export const checkUserEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "User with email not found" });
  }

  req.user = rows[0];
  console.log("User found:", req.user);

  next(); // Proceed to the next middleware or route handler
};
