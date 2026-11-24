import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email address');
const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Use no more than 128 characters');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80, 'Name is too long'),
  email,
  password,
});

export const loginSchema = z.object({ email, password });

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your name').max(80, 'Name is too long').optional(),
    email: email.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide a profile field to update',
  });
