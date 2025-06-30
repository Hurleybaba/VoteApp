import pool from "../database.js";
import cloudinary from "../Utils/upload.js";
import { v4 as uuidv4 } from "uuid";

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

export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing user ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    try {
      // Convert buffer to base64 data URI
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "profile_pictures",
        public_id: `profile_${userId}_${Date.now()}`,
      });

      // Update user profile in database
      await pool.query("UPDATE users SET profile_id = ? WHERE userid = ?", [
        uploadResponse.secure_url,
        userId,
      ]);

      return res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        imageUrl: uploadResponse.secure_url,
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to cloud storage",
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile picture",
    });
  }
};

export const getVerifiedUsers = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "No user ID found" });
    }

    console.log("Fetching verified users for user:", userId);

    // First check if the tables exist and have the correct structure
    try {
      const [tables] = await pool.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('users', 'academic_details')
      `);

      console.log("Available tables:", tables);

      if (tables.length !== 2) {
        throw new Error("Required tables not found");
      }
    } catch (tableError) {
      console.error("Table check error:", tableError);
      throw new Error("Database structure error: " + tableError.message);
    }

    // Fetch verified users (users with academic details)
    const [verifiedUsers] = await pool.query(
      `SELECT DISTINCT u.userid, u.username, u.email, u.profile_id, a.matric_no
      FROM users u
      INNER JOIN academic_details a ON u.userid = a.userid
      WHERE u.role = 'user'
      AND u.userid NOT IN (
          SELECT c.candidate_id
          FROM candidates c
      )
      ORDER BY u.username ASC;`
    );


    console.log("Found verified users:", verifiedUsers);

    if (!verifiedUsers || verifiedUsers.length === 0) {
      return res.status(200).json({
        success: true,
        verifiedUsers: [],
        message: "No verified users found",
      });
    }

    return res.status(200).json({
      success: true,
      verifiedUsers: verifiedUsers,
    });
  } catch (error) {
    console.error("Error in getVerifiedUsers:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error on getVerifiedUsers",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
              code: error.code,
            }
          : undefined,
    });
  }
};
