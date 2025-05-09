import pool from "../database.js";

export const getHome = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "No user ID found" });
    }

    // Fetch user data and elections data in parallel for better performance
    const [user, ongoingElections, upcomingElections] = await Promise.all([
      pool.query("SELECT * FROM users WHERE userid = ?", [userId]),
      pool.query("SELECT * FROM elections WHERE status = 'ongoing'"),
      pool.query("SELECT * FROM elections WHERE status = 'upcoming'"),
    ]);

    if (user[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return both user data and home content
    return res.status(200).json({
      user: user[0][0], // First user from first array (result of query)
      ongoingElections: ongoingElections[0], // All ongoing elections data
      upcomingElections: upcomingElections[0],
    });
  } catch (error) {
    console.error("Error in getHome:", error);
    return res
      .status(500)
      .json({ message: "Internal server error on getHome" });
  }
};

export const getMenu = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "No user ID found" });
    }

    const [user] = await pool.query("SELECT * FROM users WHERE userid = ?", [
      userId,
    ]);

    if (user[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: user[0][0],
    });
  } catch (error) {
    console.error("Error in getMenu:", error);
    return res
      .status(500)
      .json({ message: "Internal server error on getMenu" });
  }
};
