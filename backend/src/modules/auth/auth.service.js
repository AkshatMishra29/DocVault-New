import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './auth.model.js';
import { config } from '../../config/index.js';

export async function registerUser({ name, email, password, pin, phone }) {
  if (!name || !email || !password || !pin) {
    const error = new Error('Name, email, password, and PIN are required.');
    error.status = 400;
    throw error;
  }

  if (pin.length < 4 || pin.length > 6) {
    const error = new Error('PIN must be between 4 and 6 digits.');
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.status = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const pinHash = await bcrypt.hash(pin, salt);

  const user = new User({
    name,
    email,
    passwordHash,
    pinHash,
    phone: phone || '',
  });

  await user.save();

  const token = jwt.sign({ userId: user._id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      tier: user.tier,
      biometricsEnabled: user.biometricsEnabled,
      offlineAccessEnabled: user.offlineAccessEnabled,
    },
    token,
  };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      tier: user.tier,
      biometricsEnabled: user.biometricsEnabled,
      offlineAccessEnabled: user.offlineAccessEnabled,
    },
    token,
    requiresPin: true,
  };
}

export async function verifyUserPin({ email, pin }) {
  if (!email || !pin) {
    const error = new Error('Email and PIN are required.');
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }

  const isPinMatch = await bcrypt.compare(pin, user.pinHash);
  if (!isPinMatch) {
    const error = new Error('Invalid Vault Security PIN.');
    error.status = 401;
    throw error;
  }

  const sessionToken = jwt.sign(
    { userId: user._id, email: user.email, pinVerified: true },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      biometricsEnabled: user.biometricsEnabled,
      offlineAccessEnabled: user.offlineAccessEnabled,
    },
    token: sessionToken,
  };
}

