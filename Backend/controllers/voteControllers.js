import pool from "../database.js";
import { nanoid } from "nanoid";
import { generatePDF, sendEmailWithReceipt } from "../sendReceipt.js";

export const voteForCandidate = async (req, res) => {};

export const checkVoteStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { electionId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    if (!electionId) {
      return res
        .status(400)
        .json({ message: "Bad Request: Election ID required" });
    }

    // Check if the user has already voted in this election
    const [existingVote] = await pool.query(
      `SELECT vote_id FROM votes WHERE voter_id = ? AND election_id = ? LIMIT 1`,
      [userId, electionId]
    );

    return res.status(200).json({
      hasVoted: existingVote.length > 0,
      timestamp: existingVote[0]?.created_at || null,
    });
  } catch (error) {
    console.error("Error in checkVoteStatus:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

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
    MAX(c.bio) AS bio,
    MAX(c.manifesto) AS manifesto,
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

export const recordVote = async (req, res) => {
  try {
    const userId = req.userId;
    const { electionId, candidateId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }
    if (!electionId || !candidateId) {
      return res.status(400).json({
        message: "Bad Request: Election ID and Candidate ID required",
      });
    }

    // Check if the user has already voted in this election
    const [existingVote] = await pool.query(
      `SELECT * FROM votes WHERE voter_id = ? AND election_id = ?`,
      [userId, electionId]
    );

    if (existingVote.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already voted in this election." });
    }
    const refNo = nanoid(14);

    // Record the vote
    await pool.query(
      `INSERT INTO votes (voter_id, election_id, candidate_id, ref_no) VALUES (?, ?, ?, ?)`,
      [userId, electionId, candidateId, refNo]
    );

    return res.status(201).json({ message: "Vote recorded successfully." });
  } catch (error) {
    console.error("Error in recordVote:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getVoteDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { electionId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }
    if (!electionId) {
      return res.status(400).json({
        message: "Bad Request: Election ID and Candidate ID required",
      });
    }

    // Fetch vote details
    const [voteDetails] = await pool.query(
      `SELECT
    v.vote_id,
    v.voted_at,
    v.ref_no,

    -- Voter details
    u.first_name AS voter_first_name,
    u.last_name AS voter_last_name,

    -- Candidate details
    c.first_name AS candidate_first_name,
    c.last_name AS candidate_last_name,

    -- Election title
    e.title AS election_title

FROM votes v
JOIN users u ON v.voter_id = u.userid
JOIN users c ON v.candidate_id = c.userid
JOIN elections e ON v.election_id = e.election_id

WHERE v.election_id = ? AND v.voter_id = ?`,
      [electionId, userId]
    );

    if (voteDetails.length === 0) {
      return res.status(404).json({ message: "Vote not found" });
    }

    return res.status(200).json({ voteDetails: voteDetails[0] });
  } catch (error) {
    console.error("Error in getVoteDetails:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const sendVoteReceipt = async (req, res) => {
  try {
    const userId = req.userId;
    const { electionId } = req.params;

    if (!userId || !electionId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Get vote details including user and candidate information
    const [voteDetails] = await pool.query(
      `SELECT 
        v.vote_id,
        v.voted_at,
        v.ref_no,
        voter.first_name as voter_first_name,
        voter.last_name as voter_last_name,
        voter.email as voter_email,
        candidate.first_name as candidate_first_name,
        candidate.last_name as candidate_last_name,
        e.title as election_title
      FROM votes v
      JOIN users voter ON v.voter_id = voter.userid
      JOIN users candidate ON v.candidate_id = candidate.userid
      JOIN elections e ON v.election_id = e.election_id
      WHERE v.voter_id = ? AND v.election_id = ?
      LIMIT 1`,
      [userId, electionId]
    );

    if (!voteDetails[0]) {
      return res.status(404).json({ message: "Vote record not found" });
    }

    const voteRecord = voteDetails[0];

    try {
      // Generate PDF
      const pdfPath = await generatePDF(voteRecord, voteRecord.ref_no);

      // Send email with PDF attachment
      await sendEmailWithReceipt(voteRecord.voter_email, pdfPath, {
        ...voteRecord,
        refNo: voteRecord.ref_no,
      });

      return res.status(200).json({
        message: "Vote receipt sent successfully",
        email: voteRecord.voter_email,
      });
    } catch (error) {
      console.error("Error generating/sending receipt:", error);
      return res.status(500).json({
        message: "Failed to generate or send receipt",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  } catch (error) {
    console.error("Error in sendVoteReceipt:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
