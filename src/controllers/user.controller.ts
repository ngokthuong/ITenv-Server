import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import {
  getAllFriendsOfUserService,
  getAllUsersService,
  getCurrentUserService,
} from '../services/user.service';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';

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

// have page
export const getAllFriendsOfUserController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt((req.query.page as string) || '1');
    // const limit = parseInt(req.query.limit as string || '1');
    const limit = 20;
    var skip = (page - 1) * limit;
    if (userId) {
      const getAllFriends = await getAllFriendsOfUserService({ userId, skip, limit });
      const response: ResponseType<typeof getAllFriends> = {
        success: true,
        data: getAllFriends,
      };
      return res.status(200).json(response);
    }
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,
    };
    return res.status(500).json(response);
  }
});

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
    console.log(users);
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
