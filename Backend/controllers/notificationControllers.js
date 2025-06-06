import pool from "../database.js";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const registerDevice = async (req, res) => {
  try {
    const { expo_token } = req.body;
    const userId = req.userId;

    console.log(
      "Registering device for user:",
      userId,
      "with token:",
      expo_token
    );

    if (!Expo.isExpoPushToken(expo_token)) {
      console.error("Invalid expo token:", expo_token);
      return res.status(400).json({ message: "Invalid Expo push token" });
    }

    // Store the token in the database
    await pool.query(
      "INSERT INTO user_devices (user_id, expo_token) VALUES (?, ?) ON DUPLICATE KEY UPDATE expo_token = ?",
      [userId, expo_token, expo_token]
    );

    console.log("Successfully registered device for user:", userId);
    res.status(200).json({ message: "Device registered successfully" });
  } catch (error) {
    console.error("Error registering device:", error);
    res.status(500).json({ message: "Failed to register device" });
  }
};

export const sendElectionNotification = async (req, res) => {
  try {
    const { faculty_name, election_name, election_id } = req.body;

    console.log("Sending election notification for:", {
      faculty_name,
      election_name,
      election_id,
    });

    // Get all users from the specified faculty with their expo tokens
    const [users] = await pool.query(
      `
  SELECT DISTINCT ud.expo_token, u.userid, u.username
  FROM users u
  JOIN user_devices ud ON u.userid = ud.user_id
  JOIN academic_details ad ON u.userid = ad.userid
  WHERE ad.faculty_name = ?
`,
      [faculty_name]
    );

    console.log("Found users to notify:", users.length);

    if (users.length === 0) {
      console.log("No users found for faculty:", faculty_name);
      return res.status(200).json({ message: "No users to notify" });
    }

    // Prepare messages for each user
    const messages = users
      .filter((user) => {
        const isValid =
          user.expo_token && Expo.isExpoPushToken(user.expo_token);
        if (!isValid) {
          console.log("Invalid token for user:", user.username);
        }
        return isValid;
      })
      .map((user) => ({
        to: user.expo_token,
        sound: "default",
        title: "New Election Created",
        body: `A new election "${election_name}" has been created for ${faculty_name} faculty.`,
        data: { election_id, type: "new_election" },
        priority: "high",
      }));

    console.log("Prepared messages for users:", messages.length);

    // Send notifications in chunks
    if (messages.length > 0) {
      const chunks = expo.chunkPushNotifications(messages);
      console.log("Split messages into chunks:", chunks.length);

      for (let chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log("Notification tickets:", ticketChunk);
        } catch (error) {
          console.error("Error sending notifications chunk:", error);
        }
      }
    }

    res.status(200).json({ message: "Notifications sent successfully" });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ message: "Failed to send notifications" });
  }
};

export const sendStatusChangeNotification = async (req, res) => {
  try {
    const { faculty_name, election_name, election_id, new_status } = req.body;

    console.log("Sending status change notification for:", {
      faculty_name,
      election_name,
      election_id,
      new_status,
    });

    // Get all users from the specified faculty with their expo tokens
    const [users] = await pool.query(
      `SELECT DISTINCT ud.expo_token, u.userid, u.username
  FROM users u
  JOIN user_devices ud ON u.userid = ud.user_id
  JOIN academic_details ad ON u.userid = ad.userid
  WHERE ad.faculty_name = ?`,
      [faculty_name]
    );

    console.log("Found users for status change:", users.length);

    if (users.length === 0) {
      console.log("No users found for faculty:", faculty_name);
      return res.status(200).json({ message: "No users to notify" });
    }

    let title = "";
    let body = "";

    switch (new_status) {
      case "ongoing":
        title = "Election Started";
        body = `The election "${election_name}" has started. You can now cast your vote!`;
        break;
      case "ended":
        title = "Election Ended";
        body = `The election "${election_name}" has ended. Check the results!`;
        break;
      default:
        title = "Election Status Updated";
        body = `The status of election "${election_name}" has been updated to ${new_status}.`;
    }

    // Prepare messages for each user
    const messages = users
      .filter((user) => {
        const isValid =
          user.expo_token && Expo.isExpoPushToken(user.expo_token);
        if (!isValid) {
          console.log("Invalid token for user:", user.username);
        }
        return isValid;
      })
      .map((user) => ({
        to: user.expo_token,
        sound: "default",
        title,
        body,
        data: { election_id, type: "status_change", new_status },
        priority: "high",
      }));

    console.log("Prepared status change messages:", messages.length);

    // Send notifications in chunks
    if (messages.length > 0) {
      const chunks = expo.chunkPushNotifications(messages);
      console.log("Split status messages into chunks:", chunks.length);

      for (let chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log("Status change notification tickets:", ticketChunk);
        } catch (error) {
          console.error(
            "Error sending status change notifications chunk:",
            error
          );
        }
      }
    }

    res
      .status(200)
      .json({ message: "Status change notifications sent successfully" });
  } catch (error) {
    console.error("Error sending status change notifications:", error);
    res
      .status(500)
      .json({ message: "Failed to send status change notifications" });
  }
};
