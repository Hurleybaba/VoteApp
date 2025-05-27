import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

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
      from: `"E-Voting System" <${process.env.USER}>`,
      to: toEmail,
      subject: "Your Verification Code",
      text: `Your verification code is ${otp}. This code will expire in 5 minutes.`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f5;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .email-body {
                background-color: #ffffff;
                border-radius: 16px;
                padding: 32px;
                margin: 20px 0;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 32px;
              }
              .logo {
                color: #E8612D;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 16px;
              }
              .title {
                color: #1F2937;
                font-size: 24px;
                font-weight: bold;
                margin: 0;
                margin-bottom: 8px;
              }
              .subtitle {
                color: #6B7280;
                font-size: 16px;
                margin: 0;
                margin-bottom: 32px;
              }
              .otp-container {
                background-color: #FDD8CD;
                border-radius: 12px;
                padding: 24px;
                text-align: center;
                margin-bottom: 32px;
              }
              .otp-code {
                color: #E8612D;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 4px;
                margin: 0;
              }
              .expiry {
                color: #4B5563;
                font-size: 14px;
                margin: 16px 0 0 0;
              }
              .footer {
                text-align: center;
                color: #6B7280;
                font-size: 14px;
              }
              .warning {
                color: #EF4444;
                font-size: 14px;
                margin-top: 24px;
                padding: 12px;
                background-color: #FEE2E2;
                border-radius: 8px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-body">
                <div class="header">
                  <div class="logo">E-VOTING SYSTEM</div>
                </div>
                
                <h1 class="title">Verify Your Email</h1>
                <p class="subtitle">Use the verification code below to complete your verification process.</p>
                
                <div class="otp-container">
                  <p class="otp-code">${otp}</p>
                  <p class="expiry">This code will expire in 5 minutes</p>
                </div>
                
                <p style="color: #4B5563; margin-bottom: 24px;">
                  If you didn't request this verification code, please ignore this email or contact support if you have concerns.
                </p>
                
                <div class="warning">
                  Never share this code with anyone. Our team will never ask for your code.
                </div>
              </div>
              
              <div class="footer">
                <p>© 2024 E-Voting System. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
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
