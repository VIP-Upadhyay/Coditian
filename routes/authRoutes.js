const express = require('express');
const { register, login, verifyOTP } = require('../controllers/authController');
const router = express.Router();

// Register, Login, and Verify OTP Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

module.exports = router;
