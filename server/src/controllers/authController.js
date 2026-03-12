import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const normalizePhoneNumber = (value) => String(value || '').replace(/\D/g, '');
const generateVerificationCode = () => String(Math.floor(100000 + Math.random() * 900000));

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  phoneNumber: user.phoneNumber,
  phoneVerified: user.phoneVerified !== false,
  email: user.email,
  role: user.role,
  notificationEnabled: user.notificationEnabled,
  locationName: user.locationName || '',
  locationVerified: Boolean(user.locationVerified),
  createdAt: user.createdAt,
});

export const signup = async (req, res, next) => {
  try {
    const { name, phoneNumber, password, email, role, locationName } = req.body;
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
    const verificationCode = generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const sanitizedLocationName = String(locationName || '').trim();

    const user = await User.create({
      name: String(name).trim(),
      phoneNumber: normalizedPhone,
      password: hashedPassword,
      email: normalizedEmail || null,
      role: role || 'buyer',
      locationName: sanitizedLocationName,
      locationVerified: Boolean(sanitizedLocationName),
      phoneVerified: false,
      phoneVerificationCode: verificationCode,
      phoneVerificationExpiresAt: verificationExpiresAt,
    });

    // Placeholder delivery channel until SMS provider integration is configured.
    console.log(`Phone verification code for ${normalizedPhone}: ${verificationCode}`);

    res.status(201).json({
      success: true,
      data: {
        requiresPhoneVerification: true,
        phoneNumber: normalizedPhone,
        expiresAt: verificationExpiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPhone = async (req, res, next) => {
  try {
    const { phoneNumber, code } = req.body;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const providedCode = String(code || '').trim();

    if (!normalizedPhone || !providedCode) {
      const error = new Error('Phone number and verification code are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ phoneNumber: normalizedPhone });

    if (!user) {
      const error = new Error('User not found for this phone number');
      error.statusCode = 404;
      throw error;
    }

    if (user.phoneVerified) {
      const token = generateToken(user._id.toString());
      res.json({
        success: true,
        data: {
          token,
          user: sanitizeUser(user),
        },
      });
      return;
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpiresAt) {
      const error = new Error('No active verification code. Please request a new code.');
      error.statusCode = 400;
      throw error;
    }

    if (new Date(user.phoneVerificationExpiresAt).getTime() < Date.now()) {
      const error = new Error('Verification code has expired. Please request a new code.');
      error.statusCode = 400;
      throw error;
    }

    if (user.phoneVerificationCode !== providedCode) {
      const error = new Error('Invalid verification code');
      error.statusCode = 400;
      throw error;
    }

    user.phoneVerified = true;
    user.phoneVerificationCode = null;
    user.phoneVerificationExpiresAt = null;
    await user.save();

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

export const resendPhoneVerificationCode = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhone) {
      const error = new Error('Phone number is required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ phoneNumber: normalizedPhone });
    if (!user) {
      const error = new Error('User not found for this phone number');
      error.statusCode = 404;
      throw error;
    }

    if (user.phoneVerified) {
      res.json({
        success: true,
        data: { message: 'Phone number already verified' },
      });
      return;
    }

    const verificationCode = generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.phoneVerificationCode = verificationCode;
    user.phoneVerificationExpiresAt = verificationExpiresAt;
    await user.save();

    // Placeholder delivery channel until SMS provider integration is configured.
    console.log(`Phone verification code for ${normalizedPhone}: ${verificationCode}`);

    res.json({
      success: true,
      data: {
        message: 'Verification code sent',
        expiresAt: verificationExpiresAt,
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

    if (user.phoneVerified === false) {
      const error = new Error('Phone number not verified. Please verify to continue.');
      error.statusCode = 403;
      error.code = 'PHONE_NOT_VERIFIED';
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

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, locationName } = req.body;
    const updates = {};

    if (name !== undefined) {
      const cleanName = String(name || '').trim();
      if (!cleanName) {
        const error = new Error('Name cannot be empty');
        error.statusCode = 400;
        throw error;
      }
      updates.name = cleanName;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (normalizedEmail && !isValidEmail(normalizedEmail)) {
        const error = new Error('Please provide a valid email address');
        error.statusCode = 400;
        throw error;
      }
      updates.email = normalizedEmail || null;
    }

    if (locationName !== undefined) {
      const cleanLocation = String(locationName || '').trim();
      updates.locationName = cleanLocation;
      updates.locationVerified = Boolean(cleanLocation);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

    res.json({
      success: true,
      data: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};
