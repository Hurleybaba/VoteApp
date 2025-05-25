import pool from "../database.js";

export const checkBlacklistToken = async (req, res, next) => {
  // Extract token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next();
  }

  try {
    // Check if the token is blacklisted
    const [result] = await pool.query(
      "SELECT * FROM blacklisted_tokens WHERE token = ? AND expires_at > NOW()",
      [token]
    );

    if (result.length > 0) {
      return res
        .status(403)
        .json({ message: "Token is blacklisted, Please log in again" });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error checking blacklist token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
