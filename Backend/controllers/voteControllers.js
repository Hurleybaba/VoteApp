import pool from "../database.js";

export const voteForCandidate = async (req, res) => {};

export const getAllVotes = async (req, res) => {
  try {
    const userId = req.userId;
    const electionId = req.headers["x-election-id"];

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    if (!electionId) {
      return res
        .status(400)
        .json({ message: "Bad Request: Election ID required" });
    }

    const [userResult, votesResult, candidatesResult] = await Promise.all([
      pool.query(
        `SELECT 
          userid, 
          username, 
          email, 
          age, 
          phone, 
          first_name, 
          middle_name, 
          last_name 
        FROM users 
        WHERE userid = ?`,
        [userId]
      ),
      pool.query(
        `SELECT 
    u.userid AS candidate_id,
    c.bio,
    c.manifesto,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    COUNT(v.vote_id) AS vote_count
FROM 
    votes v
JOIN 
    candidates c ON v.candidate_id = c.candidate_id
JOIN 
    users u ON c.candidate_id = u.userid
WHERE 
    v.election_id = ?
GROUP BY 
    u.userid, u.first_name, u.last_name;`,
        [electionId]
      ),
      pool.query(
        `SELECT 
            c.*, 
            u.first_name, 
            u.middle_name, 
            u.last_name
        FROM 
            candidates c
        JOIN 
            users u ON c.candidate_id = u.userid
        WHERE 
            c.election_id = ?`,
        [electionId]
      ),
    ]);

    const user = userResult[0][0]; // Extract first row
    const votes = votesResult[0];
    const candidates = candidatesResult[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Sensitive Data Filtering
    const safeUserData = {
      ...user,
      password: undefined, // Explicitly remove sensitive fields
    };

    // 5. Response
    return res.status(200).json({
      user: safeUserData,
      votes: votes || [], // Ensure array even if empty
      candidates: candidates || [], // Ensure array even if empty
    });
  } catch (error) {
    console.error("Error in getAllVotes:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
