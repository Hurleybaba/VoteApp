import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: process.env.SMTP_PORT || 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.USER,
//     pass: process.env.PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

export const sendOtpEmail = async (toEmail, otp) => {
  try {
    const mailOptions = {
      from: `"Your App Name" <${process.env.USER}>`,
      to: toEmail,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html: `
        <div>
          <h2>Your Verification Code</h2>
          <p>Your OTP code is: <strong>${otp}</strong></p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send OTP email");
  }
};
