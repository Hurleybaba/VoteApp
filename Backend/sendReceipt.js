import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePDF = async (voteDetails, refNo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const filePath = path.join(
        __dirname,
        `receipts/vote_receipt_${refNo}.pdf`
      );

      // Ensure the receipts directory exists
      if (!fs.existsSync(path.join(__dirname, "receipts"))) {
        fs.mkdirSync(path.join(__dirname, "receipts"));
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Define colors
      const primaryColor = "#E8612D";
      const secondaryColor = "#1F2937";
      const tertiaryColor = "#6B7280";

      // Add decorative header
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

      // Add white text for the header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor("white")
        .text("Vote Confirmation Receipt", 50, 50, { align: "center" });

      doc.moveDown(0.5);
      doc
        .fontSize(18)
        .font("Helvetica")
        .text("2025 Elections", { align: "center" });

      // Add a decorative line
      doc.moveDown(2);
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .lineWidth(2)
        .stroke(primaryColor);

      // Add vote details in a structured box
      doc.moveDown();
      doc.fontSize(14).font("Helvetica-Bold").fillColor(secondaryColor);

      const details = [
        {
          label: "Date",
          value: new Date(voteDetails.voted_at).toLocaleString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        },
        {
          label: "Student",
          value: `${voteDetails.voter_first_name} ${voteDetails.voter_last_name}`,
        },
        {
          label: "Voted for",
          value: `${voteDetails.candidate_first_name} ${voteDetails.candidate_last_name}`,
        },
        { label: "Post", value: voteDetails.election_name },
      ];

      // Create a box for details
      const boxY = doc.y;
      doc
        .rect(50, boxY, doc.page.width - 100, 160)
        .lineWidth(1)
        .stroke("#E5E7EB");

      details.forEach((detail, index) => {
        const yPos = boxY + 20 + index * 35;
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor(tertiaryColor)
          .text(detail.label, 70, yPos);

        doc
          .font("Helvetica")
          .fontSize(12)
          .fillColor(secondaryColor)
          .text(detail.value, 70, yPos + 16);
      });

      // Add reference number in a highlighted box
      doc.moveDown(8);
      const refBoxY = doc.y;
      doc.rect(50, refBoxY, doc.page.width - 100, 60).fill("#FFF5F1");

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("Reference Number", 70, refBoxY + 15);

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(refNo, 70, refBoxY + 32);

      // Add security badge
      doc.moveDown(3);
      const badgeY = doc.y;
      doc
        .rect(50, badgeY, doc.page.width - 100, 50)
        .lineWidth(1)
        .stroke("#E5E7EB");

      // Add checkmark symbol and security text
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#10B981")
        .text("✓", 70, badgeY + 18);

      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor(secondaryColor)
        .text(
          "Vote recorded securely and verified by the system",
          90,
          badgeY + 18
        );

      // Add footer
      doc.moveDown(4);
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(tertiaryColor)
        .text(
          "This is an official voting receipt. Please keep it for your records.",
          {
            align: "center",
          }
        );

      // Finalize the PDF
      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const sendEmailWithReceipt = async (userEmail, pdfPath, voteDetails) => {
  try {
    const transporter = nodemailer.createTransport({
      // Configure your email service here
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: `"E-Voting System" <${process.env.USER}>`,
      to: userEmail,
      subject: "Your Voting Receipt",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #E8612D;">Vote Confirmation Receipt</h2>
          <p>Dear ${voteDetails.voter_first_name},</p>
          <p>Thank you for participating in the 2025 Elections. Your vote has been successfully recorded.</p>
          <p>Please find your voting receipt attached to this email.</p>
          <p>Reference Number: <strong>${voteDetails.refNo}</strong></p>
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
      attachments: [
        {
          filename: `vote_receipt_${voteDetails.refNo}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Delete the PDF file after sending
    fs.unlink(pdfPath, (err) => {
      if (err) console.error("Error deleting PDF:", err);
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
