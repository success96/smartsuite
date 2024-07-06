const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Utility functions
exports.generateToken = (user) => {
    return jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES });
  };
  
exports.hashPassword = (password) => {
    return bcrypt.hashSync(password, 8);
  };


