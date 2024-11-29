const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP } = require('../utils/mailer');
const speakeasy = require('speakeasy');

const temporaryStorage = {};

const register = async (req, res) => {
  const { name, email, password, role, subscriptionStatus } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).send('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const secret = speakeasy.generateSecret({ length: 20 }).base32;

  temporaryStorage[email] = {
    name,
    email,
    password: hashedPassword,
    role,
    subscriptionStatus,
    secret,
    createdAt: Date.now(),
  };

  sendOTP(email, secret);
  res.status(201).send('OTP sent, please verify to complete registration');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ message: 'Login successful', token });
};

const verifyOTP = async (req, res) => {
  const { email, token } = req.body;
  const userData = temporaryStorage[email];
  if (!userData) return res.status(404).send('No pending registration found or token expired');

  if (Date.now() - userData.createdAt > 10 * 60 * 1000) {
    delete temporaryStorage[email];
    return res.status(400).send('OTP expired');
  }

  const verified = speakeasy.totp.verify({
    secret: userData.secret,
    encoding: 'base32',
    token,
    step: 600,
  });

  if (verified) {
    const user = new User(userData);
    await user.save();
    delete temporaryStorage[email];

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'OTP verified, user registered and logged in', token: authToken });
  } else {
    res.status(400).send('Invalid OTP');
  }
};

module.exports = { register, login, verifyOTP };
