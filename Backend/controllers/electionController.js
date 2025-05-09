import pool from "../database.js";

export const getPosts = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "No user ID found" });
    }

    // Fetch user data and elections data in parallel for better performance
    const [user, news] = await Promise.all([
      pool.query("SELECT * FROM users WHERE userid = ?", [userId]),
      pool.query("SELECT * FROM elections"),
    ]);

    if (user[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return both user data and home content
    return res.status(200).json({
      user: user[0][0], // First user from first array (result of query)
      posts: news[0], // All election data
    });
  } catch (error) {
    console.error("Error in getPosts:", error);
    return res
      .status(500)
      .json({ message: "Internal server error on getPosts" });
  }
};

export const getSinglePost = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No user ID found" });
    }

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    // Fetch user data and elections data in parallel for better performance
    const [user, post] = await Promise.all([
      pool.query("SELECT * FROM users WHERE userid = ?", [userId]),
      pool.query("SELECT * FROM elections WHERE postid = ?", [postId]),
    ]);

    if (user[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (post[0].length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Return both user data and home content
    return res.status(200).json({
      user: user[0][0],
      posts: post[0][0],
    });
  } catch (error) {
    console.error("Error in getSinglePost:", error);
    return res
      .status(500)
      .json({ message: "Internal server error on getSinglePost" });
  }
};
