import jwt from 'jsonwebtoken';

export const generateAccessToken = (accId: string, role: string, userId: string): string => {
  return jwt.sign({ _accId: accId, role, userId: userId }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
};

export const generateRefreshToken = (accId: string): string => {
  return jwt.sign({ _accId: accId }, process.env.JWT_SECRET as string, { expiresIn: '15d' });
};
