const { User } = require('../models');
const jwt = require('jsonwebtoken');

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || user.role !== 'Admin') {
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // Use plain text comparison for password verification
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Store the token in the database
    user.token = token;
    await user.save();

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during admin login', error: error.message });
  }
};
