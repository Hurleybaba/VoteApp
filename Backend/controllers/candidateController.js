import pool from "../database.js";

export const getCandidates = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "No user ID found" });
    }

    // Fetch user data and elections data in parallel for better performance
    const [user, candidates] = await Promise.all([
      pool.query("SELECT * FROM users WHERE userid = ?", [userId]),
      pool.query("SELECT * FROM candidates"),
    ]);

    if (user[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return both user data and home content
    return res.status(200).json({
      user: user[0][0], // First user from first array (result of query)
      candidates: candidates[0],
    });
  } catch (error) {
    console.error("Error in getCandidates:", error);
    return res
      .status(500)
      .json({ message: "Internal server error on getCandidates" });
  }
};

export const getSingleCandidate = async (req, res) => {
  try {
    const userId = req.userId;
    const candidateId = req.params.candidateId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No user ID found" });
    }

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    // Fetch user data and elections data in parallel for better performance
    const [user, candidate] = await Promise.all([
      pool.query("SELECT * FROM users WHERE userid = ?", [userId]),
      pool.query("SELECT * FROM candidates WHERE candidateid = ?", [
        candidateId,
      ]),
    ]);

    if (user[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (candidate[0].length === 0) {
      return res.status(404).json({ message: "Candidate does not exist" });
    }

    // Return both user data and home content
    return res.status(200).json({
      user: user[0][0],
      candidate: candidate[0][0],
    });
  } catch (error) {
    console.error("Error in getSingleCandidate:", error);
    return res
      .status(500)
      .json({ message: "Internal server error on getSingleCandidate" });
  }
};
