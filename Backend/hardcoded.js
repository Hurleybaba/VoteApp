import pool from "./database.js";

export const testDb = async (req, res) => {
  try {
    const [users, candidates] = await Promise.all([
      pool.query("SELECT * FROM users"),
      pool.query("SELECT * FROM candidates"),
    ]);

    res.json({
      users: users[0],
      candidates: candidates[0],
    });
  } catch (error) {
    console.error("Error in testDb:", error);
    return res
      .status(500)
      .json({ message: "Internal executing multiple queries" });
  }
};
