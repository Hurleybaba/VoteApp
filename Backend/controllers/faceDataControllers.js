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
    const [userCheck] = await pool.query(
      "SELECT userid FROM users WHERE userid = ?",
      [userid]
    );

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
    let created_at = timestamp || new Date().toISOString();

    created_at = created_at.replace(/\.\d{3}Z$/, "").replace("T", " ");

    const metadataToStore = metadata ? JSON.stringify(metadata) : null;

    const result = await pool.query(
      "INSERT INTO faces (userid, face_id, image, created_at, metadata) VALUES (?, ?, ?, ?, ?)",
      [userid, face_id, imageBuffer, created_at, metadataToStore]
    );
    if (result.affectedRows !== 0) {
      return res.status(201).json({
        success: true,
        face_id: face_id,
        message: "Face data stored successfully",
        timestamp: created_at,
      });
    } else {
      // This case might occur if the query succeeds but no rows are affected (unlikely for INSERT)
      return res.status(500).json({
        success: false,
        message: "Failed to insert face data into the database.",
      });
    }
  } catch (error) {
    console.error("MySQL error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to store face data",
      error: error.message,
    });
  }
};

export const setAcademicData = async (req, res) => {
  const { userid } = req.params;
  const { department, faculty, matricNo, level } = req.body;

  if (!faculty) {
    return res.status(400).json({
      success: false,
      message: "faculty fields are required",
    });
  }
  if (!department) {
    return res.status(400).json({
      success: false,
      message: "department fields are required",
    });
  }
  if (!matricNo) {
    return res.status(400).json({
      success: false,
      message: "matric fields are required",
    });
  }
  if (!level) {
    return res.status(400).json({
      success: false,
      message: "level fields are required",
    });
  }

  if (!userid) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    // Check if user exists (optional)
    const [userCheck] = await pool.query(
      "SELECT userid FROM users WHERE userid = ?",
      [userid]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const faculties = {
      "Applied Sciences": 1050,
      Law: 1250,
      "Medical Sciences": 1500,
      Pharmacy: 2100,
    };

    const facultyId = faculties[faculty];

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty name provided",
      });
    }

    let verified_at = new Date().toISOString();

    verified_at = verified_at.replace(/\.\d{3}Z$/, "").replace("T", " ");

    const result = await pool.query(
      "INSERT INTO academic_details (faculty_id, faculty_name, department, matric_no, level, userid, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [facultyId, faculty, department, matricNo, level, userid, verified_at]
    );
    return res.status(201).json({
      success: true,
      message: "Academic data stored successfully",
      timestamp: verified_at,
    });
  } catch (error) {
    console.error("MySQL error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to store academic data",
      error: error.message,
    });
  }
};

export const getFaceData = async (req, res) => {
  const { userid } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM faces WHERE userid = ?", [
      userid,
    ]);
    if (rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: "Face data not found" });
    }
  } catch (error) {
    console.error("Error retrieving face data:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve face data" });
  }
};

export const getAcademicData = async (req, res) => {
  const { userid } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM academic_details WHERE userid = ?",
      [userid]
    );
    if (rows.length > 0) {
      res.status(200).json({ success: true, userAcademicData: rows[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Academic data not found" });
    }
  } catch (error) {
    console.error("Error retrieving academic data:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve academic data" });
  }
};

// export const getFaceData = async (req, res) => {};
