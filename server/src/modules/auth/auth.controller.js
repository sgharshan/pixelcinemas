import {
  createToken,
  getUserById,
  loginUser,
  publicUser,
  registerUser,
  updateUserProfile,
} from './auth.service.js';

export async function register(request, response) {
  const user = await registerUser(request.body);
  response.status(201).json({
    user: publicUser(user),
    token: createToken(user, request.app.locals.jwtSecret),
  });
}

export async function login(request, response) {
  const user = await loginUser(request.body);
  response.json({
    user: publicUser(user),
    token: createToken(user, request.app.locals.jwtSecret),
  });
}

export async function getProfile(request, response) {
  const user = await getUserById(request.user.id);
  response.json({ user: publicUser(user) });
}

export async function updateProfile(request, response) {
  const user = await updateUserProfile(request.user.id, request.body);
  response.json({ user: publicUser(user) });
}
