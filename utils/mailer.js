const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services (e.g., Outlook, Yahoo) or a custom SMTP server
  auth: {
    user: process.env.EMAIL_USER, // Your email address from environment variables
    pass: process.env.EMAIL_PASS, // Your email password from environment variables
  },
});

/**
 * Sends an email
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content for the email body
 * @returns {Promise<void>}
 */
const sendMail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error('Failed to send email');
  }
};

/**
 * Sends an OTP email
 * @param {string} email - Recipient's email address
 * @param {string} otp - The OTP to include in the email
 * @returns {Promise<void>}
 */
const sendOTP = async (email, secret) => {
    const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
        step: 600, // Token valid for 10 minutes
        window: 0,
    });
  const htmlContent = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            body {
              font-family: 'Roboto', sans-serif;
              background-color: #f4f7fa;
              color: #333;
              padding: 20px;
              margin: 0;
            }
            .neomorphism {
              background: linear-gradient(145deg, #ffffff, #e6e6e6);
              border-radius: 20px;
              box-shadow: 12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff;
              padding: 30px;
              text-align: center;
              width: 340px;
              margin: 40px auto;
              transition: all 0.3s ease-in-out;
            }
            .neomorphism:hover {
              box-shadow: 0px 0px 20px #aeaec0, -0px -0px 20px #ffffff;
            }
            .token {
              font-size: 28px;
              color: #f1f1f1;
              font-weight: bold;
              margin: 20px 0;
              background: -webkit-linear-gradient(45deg, #007bff, #0056b3);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .header {
              color: #000;
              font-size: 34px;
              font-weight: bold;
              margin-bottom: 10px;
              text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
              animation: fadeIn 3s ease-in-out infinite;
            }
            h2 {
              font-size: 22px;
              color: #444;
              margin: 10px 0;
              text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
            }
            p {
              font-size: 16px;
              line-height: 1.5;
            }
            @keyframes fadeIn {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
          </style>
        </head>
        <body>
          <div class="neomorphism">
            <h1 class="header">Coditian</h1>
            <h2>Your OTP</h2>
            <p class="token">${token}</p>
            <p>Enter this code on the website to proceed. The code is valid for 10 minutes.</p>
          </div>
        </body>
      </html>
    `;
    console.log("OTP is "+token);
  await sendMail(email, 'Your OTP - Coditian', htmlContent);
};

module.exports = {
  sendMail,
  sendOTP,
};
