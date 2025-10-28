import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Read JSON data
const emailData = JSON.parse(fs.readFileSync("test-email.json", "utf8"));

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send mail
async function main() {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
  }
}

main();
