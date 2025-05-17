import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

export const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.USER,
    to: toEmail,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};
