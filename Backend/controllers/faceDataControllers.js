import express from "express";
import pool from "../database.js";
import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

const base64Regex = /^data:image\/(png|jpeg|jpg);base64,/;

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

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
    // Check if user exists
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

    // Get the last 8 characters of the matric number
    const lastEightChars = matricNo.slice(-8);
    console.log("Checking matric number:", lastEightChars);

    // Check if the matric number exists in departmental_recordsss table
    const [departmentalRecord] = await pool.query(
      "SELECT * FROM departmental_recordsss WHERE Matric_number LIKE ?",
      [`%${lastEightChars}`]
    );

    if (departmentalRecord.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Your details are not found in the department database. Please verify your matric number.",
        errorType: "MATRIC_NOT_FOUND",
      });
    }

    // Check if academic details already exist for this matric number
    const [existingRecord] = await pool.query(
      "SELECT * FROM academic_details WHERE matric_no = ?",
      [matricNo]
    );

    if (existingRecord.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This matric number has already been registered. Please contact support if this is an error.",
        errorType: "DUPLICATE_MATRIC",
      });
    }

    const faculties = {
      "Applied Sciences": 1050,
      Law: 1250,
      "Medical Sciences": 1500,
      Pharmacy: 2100,
      General: 2500,
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
      message:
        "Your details have been confirmed in the department database. Details sent successfully!",
      timestamp: verified_at,
      departmentRecord: departmentalRecord[0],
    });
  } catch (error) {
    console.error("MySQL error:", error);

    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message:
          "This matric number has already been registered. Please contact support if this is an error.",
        errorType: "DUPLICATE_MATRIC",
      });
    }

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

  if (!userid) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
      errorType: "MISSING_USERID",
    });
  }

  try {
    // First check if user exists
    const [userCheck] = await pool.query(
      "SELECT userid FROM users WHERE userid = ?",
      [userid]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errorType: "USER_NOT_FOUND",
      });
    }

    // Then check for academic details
    const [rows] = await pool.query(
      "SELECT * FROM academic_details WHERE userid = ?",
      [userid]
    );

    if (rows.length > 0) {
      return res.status(200).json({
        success: true,
        userAcademicData: rows[0],
        message: "Academic data retrieved successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No academic data found for this user",
        errorType: "NO_ACADEMIC_DATA",
      });
    }
  } catch (error) {
    console.error("Error retrieving academic data:", error);

    // Handle specific database errors
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        success: false,
        message: "Database table not found. Please contact support.",
        errorType: "DATABASE_ERROR",
      });
    }

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(500).json({
        success: false,
        message: "Database access denied. Please contact support.",
        errorType: "DATABASE_ERROR",
      });
    }

    // Handle any other errors
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve academic data",
      errorType: "SERVER_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const verifyFace = async (req, res) => {
  try {
    const { userId } = req;
    const { image } = req.body;

    console.log("Verifying face for userId:", userId);
    console.log("Image data received:", image ? "Yes" : "No");

    if (!image) {
      console.log("No image data provided");
      return res.status(400).json({
        success: false,
        message: "Base64 image data is required",
        errorType: "NO_IMAGE",
      });
    }

    if (!base64Regex.test(image)) {
      console.log("Invalid image format");
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Use base64 encoded JPEG/PNG",
        errorType: "INVALID_FORMAT",
      });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    if (base64Data.length > 10 * 1024 * 1024) {
      console.log("Image too large:", base64Data.length);
      return res.status(400).json({
        success: false,
        message: "Image size too large (max 10MB)",
        errorType: "IMAGE_TOO_LARGE",
      });
    }

    const imageBuffer = Buffer.from(base64Data, "base64");
    console.log("Image buffer created successfully");

    const [userFaceData] = await pool.query(
      "SELECT image FROM faces WHERE userid = ?",
      [userId]
    );

    console.log("User face data found:", userFaceData ? "Yes" : "No");

    if (!userFaceData || userFaceData.length === 0) {
      console.log("No face data found for user");
      return res.status(404).json({
        success: false,
        message:
          "Face data not found. Please complete your KYC verification first.",
        errorType: "NO_FACE_DATA",
      });
    }

    // Compare the faces
    const compareParams = {
      SourceImage: { Bytes: imageBuffer },
      TargetImage: { Bytes: userFaceData[0].image },
      SimilarityThreshold: 80,
    };

    console.log("Sending request to AWS Rekognition");

    try {
      const compareResponse = await rekognition
        .compareFaces(compareParams)
        .promise();

      console.log("AWS Rekognition response:", compareResponse);
      const matches = compareResponse.FaceMatches;

      if (!matches || matches.length === 0) {
        console.log("No face matches found");
        return res.status(400).json({
          success: false,
          message:
            "No matching face found. Please ensure your face is clearly visible and try again.",
          errorType: "NO_MATCH",
        });
      }

      console.log("Similarity score:", matches[0].Similarity);

      if (matches[0].Similarity < 80) {
        console.log("Low similarity score");
        return res.status(400).json({
          success: false,
          message:
            "Face verification failed. The similarity score is too low. Please try again with better lighting.",
          errorType: "LOW_SIMILARITY",
          similarity: matches[0].Similarity,
        });
      }

      console.log("Face verification successful");
      return res.json({
        success: true,
        message: "Face verified successfully",
        data: matches[0],
      });
    } catch (rekognitionError) {
      console.error("AWS Rekognition error:", rekognitionError);
      return res.status(400).json({
        success: false,
        message:
          "Face verification failed. Please ensure your face is clearly visible and try again.",
        errorType: "REKOGNITION_ERROR",
        details: rekognitionError.message,
      });
    }
  } catch (error) {
    console.error("Error verifying face data:", error);
    return res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred during face verification. Please try again.",
      errorType: "SERVER_ERROR",
      details: error.message,
    });
  }
};
