
// require("dotenv").config();
// const nodemailer = require("nodemailer");

// // Ensure environment variables are set
// if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL) {
//   console.error("❌ Missing required environment variables!");
//   process.exit(1);
// }

// const transporter = nodemailer.createTransport({
//   host: "smtp.resend.com",
//   port: 587,
//   secure: false, // Use `true` for port 465
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   },
// });

// const sendEmail = async (to, subject, text) => {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL, // Ensure this is a verified email
//       to,
//       subject,
//       text
//     });
//     console.log("✅ Email sent successfully:", info.messageId);
//   } catch (error) {
//     console.error("❌ Error sending email:", error.message);
//   }
// };

// // Usage example

// module.exports = { sendEmail };
require("dotenv").config();
const nodemailer = require("nodemailer");

// Ensure environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Missing required environment variables!");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text
    });
    console.log("✅ Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};

// Usage example - commented out to avoid sending test emails
// sendEmail("receiver@example.com", "Test Email", "This is a test email using Gmail SMTP!");
