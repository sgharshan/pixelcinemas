import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { AppError } from '../../middleware/errorHandler.js';

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function createToken(user, secret) {
  return jwt.sign({ role: user.role }, secret, {
    subject: String(user.id),
    expiresIn: '2h',
  });
}

export async function registerUser(input) {
  const existing = await User.exists({ email: input.email });
  if (existing) {
    throw new AppError('EMAIL_EXISTS', 'An account already uses this email', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    return await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'customer',
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError('EMAIL_EXISTS', 'An account already uses this email', 409);
    }
    throw error;
  }
}

export async function loginUser(input) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!valid) {
    throw new AppError('INVALID_CREDENTIALS', 'Email or password is incorrect', 401);
  }
  return user;
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw new AppError('UNAUTHENTICATED', 'Sign in to continue', 401);
  return user;
}

export async function updateUserProfile(id, input) {
  if (input.email) {
    const duplicate = await User.exists({ email: input.email, _id: { $ne: id } });
    if (duplicate) {
      throw new AppError('EMAIL_EXISTS', 'An account already uses this email', 409);
    }
  }

  const user = await User.findByIdAndUpdate(id, input, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!user) throw new AppError('UNAUTHENTICATED', 'Sign in to continue', 401);
  return user;
}
