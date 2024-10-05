import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { any, string } from 'joi';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user';
import Account from '../models/account';
import { generate } from 'otp-generator';
import { generateAccessToken } from '../middlewares/jwt.mdw';
import { getAllUsersService, getCurrentUserService } from '../services/user.service';

interface AuthRequest extends Request {
  user?: { _id: string; role: string; user: string };
}
// export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
//   const user = await User.findById(req?.user?.user).populate({
//     path: 'account',
//     select: 'role isBlocked email', // Populate account fields
//   });

//   if (user) {
//     const account = await Account.findById(req?.user?._id);
//     const responseData = {
//       username: user.username,
//       dob: user.dob,
//       phoneNumber: user.phoneNumber,
//       avatar: user.avatar,
//       posts: user.posts,
//       notifications: user.notifications,
//       submissions: user.submissions,
//       gender: user.gender,
//       status: user.status,
//       lastOnline: user.lastOnline,
//       email: account?.email,
//       role: account?.role,
//       isBlocked: account?.isBlocked,
//     };

//     res.json(responseData);
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const responseData = await getCurrentUserService(req);
    res.json(responseData);
  } catch (error: any) {
    res.status(404);
    throw new Error(error.message);
  }
});
// export const getAllUser = asyncHandler(async (req: AuthRequest, res: Response) => {
//   const { page = 1, limit = 10, search = '' } = req.query;

//   const pageNumber = Number(page) || 1;
//   const limitNumber = Number(limit) || 10;

//   const searchQuery = search
//     ? {
//       $or: [
//         { username: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//       ],
//     }
//     : {};

//   const users = await User.find(searchQuery)
//     .populate({
//       path: 'account',
//       select: 'role isBlocked email',
//     })
//     .skip((pageNumber - 1) * limitNumber)
//     .limit(limitNumber);

//   const total = await User.countDocuments(searchQuery);

//   res.json({
//     success: true,
//     total,
//     data: users,
//   });
// });

export const getAllUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, q = '' } = req.query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;

  try {
    const { total, users } = await getAllUsersService(pageNumber, limitNumber, q.toString());

    res.json({
      success: true,
      total,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
