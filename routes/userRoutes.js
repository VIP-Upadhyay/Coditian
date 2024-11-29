// require('dotenv').config();
// const express = require('express');
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const speakeasy = require('speakeasy');

// const router = express.Router();

// // Setup email transporter using environment variables
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const temporaryStorage = {};

// // Register User
// router.post('/register', async (req, res) => {
//   const { name, email, password, role, subscriptionStatus } = req.body;
//   const userExists = await User.findOne({ email });
//   if (userExists) return res.status(400).send('User already exists');

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const secret = speakeasy.generateSecret({ length: 20 }).base32;
//   temporaryStorage[email] = {
//     name,
//     email,
//     password: hashedPassword,
//     role,
//     subscriptionStatus,
//     secret,
//     createdAt: Date.now(),
//   };

//   console.log('Generated secret:', secret); // Debugging line

//   sendOTP(email, secret);
//   res.status(201).send('OTP sent, please verify to complete registration');
// });

// // Send OTP
// function sendOTP(email, secret) {
//   const token = speakeasy.totp({
//     secret: secret,
//     encoding: 'base32',
//     step: 600, // Token valid for 10 minutes
//     window: 0,
//   });


//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Your OTP - Coditian',
//     html: `
//       <html>
//         <head>
//           <style>
//             @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
//             body {
//               font-family: 'Roboto', sans-serif;
//               background-color: #f4f7fa;
//               color: #333;
//               padding: 20px;
//               margin: 0;
//             }
//             .neomorphism {
//               background: linear-gradient(145deg, #ffffff, #e6e6e6);
//               border-radius: 20px;
//               box-shadow: 12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff;
//               padding: 30px;
//               text-align: center;
//               width: 340px;
//               margin: 40px auto;
//               transition: all 0.3s ease-in-out;
//             }
//             .neomorphism:hover {
//               box-shadow: 0px 0px 20px #aeaec0, -0px -0px 20px #ffffff;
//             }
//             .token {
//               font-size: 28px;
//               color: #f1f1f1;
//               font-weight: bold;
//               margin: 20px 0;
//               background: -webkit-linear-gradient(45deg, #007bff, #0056b3);
//               -webkit-background-clip: text;
//               -webkit-text-fill-color: transparent;
//             }
//             .header {
//               color: #000;
//               font-size: 34px;
//               font-weight: bold;
//               margin-bottom: 10px;
//               text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
//               animation: fadeIn 3s ease-in-out infinite;
//             }
//             h2 {
//               font-size: 22px;
//               color: #444;
//               margin: 10px 0;
//               text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
//             }
//             p {
//               font-size: 16px;
//               line-height: 1.5;
//             }
//             @keyframes fadeIn {
//               0%, 100% { opacity: 0.5; }
//               50% { opacity: 1; }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="neomorphism">
//             <h1 class="header">Coditian</h1>
//             <h2>Your OTP</h2>
//             <p class="token">${token}</p>
//             <p>Enter this code on the website to proceed. The code is valid for 10 minutes.</p>
//           </div>
//         </body>
//       </html>
//     `,
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log('Error sending email:', error);
//     } else {
//       console.log('Email sent:', info.response);
//     }
//   });
// }

// // Verify OTP
// router.post('/verify-otp', async (req, res) => {
//   const { email, token } = req.body;
//   const userData = temporaryStorage[email];
//   if (!userData) return res.status(404).send('No pending registration found or token expired');


//   // Ensure OTP is still valid within the 10-minute window
//   if (Date.now() - userData.createdAt > 10 * 60 * 1000) {
//     delete temporaryStorage[email];
//     return res.status(400).send('OTP expired');
//   }

//   const verified = speakeasy.totp.verify({
//     secret: userData.secret,
//     encoding: 'base32',
//     token,
//     step: 600, // Ensure this matches the generation step
//     window: 0,
//   });

//   console.log('OTP verification status:', verified);

//   if (verified) {
//     const user = new User(userData);
//     await user.save();
//     delete temporaryStorage[email];
//     const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ message: 'OTP verified, user registered and logged in', token: authToken });
//   } else {
//     res.status(400).send('Invalid OTP');
//   }
// });

// // Login User
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Compare passwords
//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const authToken = jwt.sign(
//       { id: user._id, role: user.role }, // Include role or any other useful info in the payload
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.json({
//       message: 'Login successful',
//       token: authToken,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         subscriptionStatus: user.subscriptionStatus,
//       },
//     });
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ message: 'Server error, please try again later' });
//   }
// });

// router.post("/test",async (req, res) => {
//   const plainPassword = '123456';
//   const hashedPassword = '$2a$10$xFZtla60S0WeQYI1dMy9UONBC.fY1LAuNTr2boED1o7hzWu519hsW';

//   bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
//     console.log('Password match:', result); // Should log true if it matches
//   });
//   return res.status(401).json({ message: 'Invalid credentials' });
// });


// module.exports = router;


const express = require('express');
const { getUser } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Protected Route Example
router.get('/getUser', authenticateToken, getUser);

module.exports = router;
