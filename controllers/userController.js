const User = require('../models/User');

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

module.exports = { getUser };
