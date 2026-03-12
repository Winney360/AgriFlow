import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const normalizePhoneNumber = (value) => String(value || '').replace(/\D/g, '');

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  phoneNumber: user.phoneNumber,
  email: user.email,
  role: user.role,
  notificationEnabled: user.notificationEnabled,
  createdAt: user.createdAt,
});

export const signup = async (req, res, next) => {
  try {
    const { name, phoneNumber, password, email, role } = req.body;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!name || !normalizedPhone || !password) {
      const error = new Error('Name, phone number, and password are required');
      error.statusCode = 400;
      throw error;
    }

    if (normalizedPhone.length < 8) {
      const error = new Error('Please provide a valid phone number with country code when possible');
      error.statusCode = 400;
      throw error;
    }

    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      const error = new Error('Please provide a valid email address');
      error.statusCode = 400;
      throw error;
    }

    if (role && !['buyer', 'seller'].includes(role)) {
      const error = new Error('Role must be buyer or seller');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });

    if (existingUser) {
      const error = new Error('Phone number is already registered');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      phoneNumber: normalizedPhone,
      password: hashedPassword,
      email: normalizedEmail || null,
      role: role || 'buyer',
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhone || !password) {
      const error = new Error('Phone number and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ phoneNumber: normalizedPhone });

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  res.json({
    success: true,
    data: sanitizeUser(req.user),
  });
};

export const switchRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['buyer', 'seller'].includes(role)) {
      const error = new Error('Role must be buyer or seller');
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { role },
      { new: true },
    );

    res.json({
      success: true,
      data: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotifications = async (req, res, next) => {
  try {
    const { notificationEnabled } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { notificationEnabled: Boolean(notificationEnabled) },
      { new: true },
    );

    res.json({
      success: true,
      data: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};
