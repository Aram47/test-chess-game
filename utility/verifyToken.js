// authUtils.js
import jwt from 'jsonwebtoken';

export const verifyToken = async (token) => {
  if (!token) throw new Error('Token missing');

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user;
  } catch {
    throw new Error('Invalid token');
  }
};
