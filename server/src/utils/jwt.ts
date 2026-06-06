import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};