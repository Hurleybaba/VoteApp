import pool from "../database.js";

export const getCandidates = async (req, res) => {
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

    const [userResult, candidatesResult] = await Promise.all([
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
      candidates: candidates || [], // Ensure array even if empty
    });
  } catch (error) {
    console.error("Error in getCandidates:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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

    const [user, candidate] = await Promise.all([
      pool.query("SELECT * FROM users WHERE userid = ?", [userId]),
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
        WHERE candidate_id = ?`,
        [candidateId]
      ),
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
