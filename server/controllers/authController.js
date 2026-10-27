const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isValidEmail, isValidMobile, isNonEmpty } = require('../utils/validators');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  state: user.state,
  district: user.district,
  village: user.village,
  language: user.language,
  userType: user.userType
});

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, confirmPassword, state, district, village, language, userType } = req.body;

    if (!isNonEmpty(name) || !isNonEmpty(email) || !isNonEmpty(mobile) || !isNonEmpty(password) || !isNonEmpty(district)) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields. District is mandatory.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (!isValidMobile(mobile)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      role: 'user',
      state: state || 'Tamil Nadu',
      district,
      village,
      language: language || 'English',
      userType: userType || 'Farmer'
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login (User Login)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isNonEmpty(email) || !isNonEmpty(password)) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'user' });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/admin-login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isNonEmpty(email) || !isNonEmpty(password)) {
      return res.status(400).json({ success: false, message: 'Please enter admin email and password.' });
    }

    const admin = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      message: 'Admin login successful.',
      token,
      user: sanitizeUser(admin)
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
};
