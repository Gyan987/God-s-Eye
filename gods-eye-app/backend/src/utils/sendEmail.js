const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !to) return;

  const client = getTransporter();
  await client.sendMail({
    from: `GOD'S EYE <${process.env.SMTP_USER}>`,
    to,
    subject,
    text
  });
};

module.exports = sendEmail;
