import pool from "../database.js";
import { v4 as uuidv4 } from "uuid";

export const getPosts = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    // Fetch user data and elections data in parallel
    const [userResult, generalElectionsResult, facultyElectionsResult] =
      await Promise.all([
        pool.query(
          "SELECT userid, username, email, age, phone, first_name, middle_name, last_name FROM users WHERE userid = ?",
          [userId]
        ),
        pool.query(
          `SELECT e.* FROM elections e 
         WHERE e.faculty_id = 'general'
         ORDER BY e.start_date DESC`
        ),
        pool.query(
          `SELECT e.* FROM elections e
         JOIN academic_details a ON e.faculty_id = a.faculty_id
         WHERE a.userid = ?
         ORDER BY e.start_date DESC`,
          [userId]
        ),
      ]);

    const user = userResult[0][0]; // Extract the user object
    const generalElections = generalElectionsResult[0];
    const facultyElections = facultyElectionsResult[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user,
      posts: generalElections,
      facultyPosts: facultyElections,
    });
  } catch (error) {
    console.error("Error in getPosts:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
//   try {
//     const userId = req.userId;
//     const postId = req.params.postId;

//     if (!userId) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized - No user ID found" });
//     }

//     if (!postId) {
//       return res.status(400).json({ message: "Post ID is required" });
//     }

//     // Fetch user data and elections data in parallel for better performance
//     const [user, post] = await Promise.all([
//       pool.query("SELECT * FROM users WHERE userid = ?", [userId]),
//       pool.query("SELECT * FROM elections WHERE postid = ?", [postId]),
//     ]);

//     if (user[0].length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (post[0].length === 0) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     // Return both user data and home content
//     return res.status(200).json({
//       user: user[0][0],
//       posts: post[0][0],
//     });
//   } catch (error) {
//     console.error("Error in getSinglePost:", error);
//     return res
//       .status(500)
//       .json({ message: "Internal server error on getSinglePost" });
//   }
// };

export const getSinglePost = async (req, res) => {
  try {
    const userId = req.userId;
    const { electionId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No user ID found" });
    }

    if (!electionId) {
      return res.status(400).json({ message: "Election ID is required" });
    }

    // Fetch user data and elections data in parallel for better performance
    const [user, election] = await Promise.all([
      pool.query("SELECT * FROM users WHERE userid = ?", [userId]),
      pool.query("SELECT * FROM elections WHERE election_id = ?", [electionId]),
    ]);

    if (user[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (election[0].length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Return both user data and home content
    return res.status(200).json({
      user: user[0][0],
      election: election[0][0],
    });
  } catch (error) {
    console.error("Error in getSinglePost:", error);
    return res
      .status(500)
      .json({ message: "Internal server error on getSinglePost" });
  }
};

export const updateElectionStatus = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { status } = req.body;

    if (!electionId || !status) {
      return res
        .status(400)
        .json({ message: "Election ID and status are required" });
    }

    // Update the election status
    const [result] = await pool.query(
      "UPDATE elections SET status = ? WHERE election_id = ?",
      [status, electionId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Election not found or no changes made" });
    }

    return res
      .status(200)
      .json({ message: "Election status updated successfully" });
  } catch (error) {
    console.error("Error in updateElectionStatus:", error);
    return res
      .status(500)
      .json({ message: "Internal server error on updateElectionStatus" });
  }
};

export const createElection = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      election_name,
      title,
      note,
      start_date,
      duration,
      status,
      faculty_name,
    } = req.body;

    // Validate required fields
    if (!election_name || !title || !start_date || !duration || !faculty_name) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Validate start date is in the future
    const startDate = new Date(start_date);
    const now = new Date();
    if (startDate <= now) {
      return res.status(400).json({
        message: "Start date must be in the future",
      });
    }

    // Validate duration is a positive number
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        message: "Duration must be a positive number",
      });
    }

    // Get faculty_id from faculty_name
    const faculties = {
      "Applied Sciences": 1050,
      Law: 1250,
      "Medical Sciences": 1500,
      Pharmacy: 2100,
      General: 2500,
    };

    const facultyId = faculties[faculty_name];

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty name provided",
      });
    }

    const election_id = uuidv4();

    // Create the election
    const [result] = await pool.query(
      `INSERT INTO elections (
        election_id,
        election_name,
        title,
        note,
        start_date,
        duration,
        status,
        faculty_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        election_id,
        election_name,
        title,
        note || null,
        start_date,
        duration,
        "upcoming",
        facultyId,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to create election");
    }

    return res.status(201).json({
      message: "Election created successfully",
      election_id: result.insertId,
    });
  } catch (error) {
    console.error("Error in createElection:", error);
    return res.status(500).json({
      message: "Internal server error on createElection",
      error: error.message,
    });
  }
};

export const getUpcomingElections = async (req, res) => {
  const faculty_id = req.params.facultyId;

  if (!faculty_id || isNaN(parseInt(faculty_id))) {
    return res.status(400).json({ message: "Valid faculty ID is required" });
  }

  try {
    const [elections] = await pool.query(
      `SELECT 
        election_id,
        election_name,
        title,
        start_date,
        duration,
        faculty_id
      FROM elections 
      WHERE faculty_id = ? AND status = 'upcoming'
      ORDER BY start_date ASC`,
      [faculty_id]
    );

    if (!elections || elections.length === 0) {
      return res.status(200).json([]);
    }

    // Format the elections data
    const formattedElections = elections.map((election) => ({
      ...election,
      // Format start_date to ISO string for consistent handling in frontend
      start_date: new Date(election.start_date).toISOString(),
    }));

    return res.status(200).json(formattedElections);
  } catch (error) {
    console.error("Error in getUpcomingElections:", error);
    return res.status(500).json({
      message: "Internal server error while fetching upcoming elections",
      error: error.message,
    });
  }
};
