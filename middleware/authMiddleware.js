const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add decoded user data to req object
    next(); // Pass control to the next middleware or route
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { authenticateToken };
