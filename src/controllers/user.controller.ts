import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { any, string } from 'joi';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user';
import Account from '../models/account';
import { generate } from 'otp-generator';
import { generateAccessToken } from '../middleware/jwt.mdw';

interface AuthRequest extends Request {
  user?: { _id: string; role: string; user: string };
}
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log(req.user);
  const user = await User.findById(req?.user?.user).populate({
    path: 'account',
    select: 'role isBlocked email', // Populate account fields
  });

  if (user) {
    const account = await Account.findById(req?.user?._id);
    const responseData = {
      username: user.username,
      dob: user.dob,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      posts: user.posts,
      notifications: user.notifications,
      submissions: user.submissions,
      gender: user.gender,
      status: user.status,
      lastOnline: user.lastOnline,
      email: account?.email,
      role: account?.role,
      isBlocked: account?.isBlocked,
    };

    res.json(responseData);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
