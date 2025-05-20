import express from "express";
import pool from "../database.js";
import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";

export const setFaceData = async (req, res) => {
  const { userid } = req.params;
  const { image, timestamp, metadata } = req.body;

  if (!image) {
    return res.status(400).json({
      success: false,
      message: "Base64 image data is required",
    });
  }

  if (!userid) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    // Validate base64 image
    const base64Regex = /^data:image\/(png|jpeg|jpg);base64,/;
    if (!base64Regex.test(image)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Use base64 encoded JPEG/PNG",
      });
    }

    // Check if user exists (optional)
    const [userCheck] = await pool.query("SELECT id FROM users WHERE id = ?", [
      userid,
    ]);

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // extract image data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    if (base64Data.length > 10 * 1024 * 1024) {
      // 10MB max
      return res.status(400).json({
        success: false,
        message: "Image size too large (max 10MB)",
      });
    }

    const imageBuffer = Buffer.from(base64Data, "base64");

    // Generate unique ID for this face record
    const face_id = uuidv4();
    const created_at = timestamp || new Date().toISOString();

    const result = await pool.query(
      "INSERT INTO faces (userid, face_id, image, created_at, metadata) VALUES (?, ?, ?, ?, ?)",
      [
        userid,
        face_id,
        imageBuffer,
        created_at,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
    return res.status(201).json({
      success: true,
      face_id: result.face_id,
      message: "Face data stored successfully",
      timestamp: created_at,
    });
  } catch (error) {
    console.error("MySQL error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to store face data",
      error: error.message,
    });
  }
};

// export const getFaceData = async (req, res) => {
//   const { userid } = req.params;

//   try {
//     const result = await pool.query(
//       "SELECT * FROM face_data WHERE userid = $1",
//       [userid]
//     );
//     if (result.rows.length > 0) {
//       res.status(200).json({ success: true, data: result.rows[0] });
//     } else {
//       res.status(404).json({ success: false, message: "Face data not found" });
//     }
//   } catch (error) {
//     console.error("Error retrieving face data:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to retrieve face data" });
//   }
// };
export const getFaceData = async (req, res) => {};
