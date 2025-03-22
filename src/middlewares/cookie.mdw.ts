import { Response } from 'express';

export const clearRefreshTokenInCookie = async (res: Response) => {
  return await res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  });
};

export const addRefreshTokenToCookie = async (res: Response, refreshToken: string) => {
  return res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 1000 });
};
