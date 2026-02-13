require("dotenv").config();
const errorHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const ExcelJS = require("exceljs");

const announce = errorHandler(async (req, res) => {
  const { notice, branches } = req.body;

  // branches is expected to be an array or a JSON string
  const selectedBranches = typeof branches === 'string' ? JSON.parse(branches) : branches || [];

  const fs = require("fs");
  const path = require("path");
  const publicDir = path.join(__dirname, "..", "public");

  let excelFile;
  try {
    const files = fs.readdirSync(publicDir);
    excelFile = files.find(file => file.endsWith(".xlsx") || file.endsWith(".xls"));
  } catch (error) {
    return res.status(500).json({ message: "Failed to access public folder." });
  }

  if (!excelFile) {
    return res.status(404).json({ message: "No Excel file found in public folder." });
  }

  const filePath = path.join(publicDir, excelFile);
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(filePath);
  } catch (error) {
    return res.status(500).json({ message: "Failed to read the Excel file." });
  }

  const worksheet = workbook.getWorksheet(1); // Get the first worksheet

  const mails = [];

  // Iterate over all rows (assuming first row is header)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    const nameCell = row.getCell(1).value;
    const branchCell = row.getCell(2).value;
    const emailCell = row.getCell(3).value;

    if (branchCell && emailCell) {
      const branchName = branchCell.toString().trim();
      const name = nameCell ? nameCell.toString().trim() : "Student";

      // Check if the branch is in the selected branches list
      // Case-insensitive comparison is safer
      const isSelected = selectedBranches.some(
        (b) => b.toLowerCase() === branchName.toLowerCase()
      );

      if (isSelected) {
        // Handle rich text or simple text for email
        const email = typeof emailCell === 'object' && emailCell.text ? emailCell.text : emailCell.toString();
        mails.push({ email: email.trim(), name: name });
      }
    }
  });

  if (mails.length === 0) {
    return res.status(404).json({ message: "No emails found for the selected branches in the data file." });
  }

  const config = {
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASS,
    },
  };

  const transporter = nodemailer.createTransport(config);

  for (const recipient of mails) {
    const html = `
    <p>Dear ${recipient.name},</p>
    <p>${notice}</p>
    <br/>
    <p>Thank you,</p>
    <p>Event Management Team.</p>
    `;

    let message = {
      from: process.env.MAIL,
      to: recipient.email,
      subject: "Announcement!!",
      html,
    };

    try {
      await transporter.sendMail(message);
    } catch (error) {
      console.error(`Error sending email to ${recipient.email}:`, error);
    }
  }

  res.status(200).json({ message: `Message sent successfully to ${mails.length} recipients.` });
});

module.exports = { announce };
