import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import {
  editAvatarByUserIdService,
  editProfileByUserIdService,
  getAllFriendsOfUserByTypeService,
  getAllUserForAdminService,
  getAllUsersService,
  getChurnUserRateService,
  getCurrentUserService,
  getDetailUserByIdService,
  getNewUsersByMonthService,
  getNewUsersTodayService,
  getTotalActiveUserService,
  getTotalUserService,
  getUserByIdService,
  getUserGrowthService,
  getUsersForFriendPageService,
  userDemographicsService,
} from '../services/user.service';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';

// ----------------------------------------------------------_USER_---------------------------------------------------------------------
// have page ( dùng để tìm friend với các type khác nhau)
// dùng trong profile của user
export const getAllFriendsOfUserByTypeController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    try {
      const userId = req.user?.userId;
      const type = req.query.type;
      const page = parseInt((req.query.page as string) || '1');
      // const limit = parseInt(req.query.limit as string || '1');
      const limit = 20;
      var skip = (page - 1) * limit;

      if (userId) {
        const getAllFriends = await getAllFriendsOfUserByTypeService({ userId, skip, limit, type });
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
  },
);

// get all user cho FriendPage ( have pageable )
export const getUsersForFriendPageController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const queryOption = req.query;

    const result = await getUsersForFriendPageService(userId as string, queryOption);
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
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
  const responseData = await getCurrentUserService(req);
  res.json(responseData);
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

export const getAllUserController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const queryOption = req.query;

  try {
    const { total, users } = await getAllUsersService(queryOption);
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

export const getUserByIdController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId;
  const currentUserId = req.user?.userId;
  const user = await getUserByIdService(userId, currentUserId!);

  if (user) {
    res.status(200).json({
      success: true,
      data: user,
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

export const editProfileByUserIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user?.userId;
  const { username, dob, phoneNumber, gender } = req.body;
  const result = await editProfileByUserIdService(
    { username, dob, phoneNumber, gender },
    userId as string,
  );
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

export const editAvatarByUserIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  const filePath = req.file?.path;
  const userId = req.user?.userId;
  const result = await editAvatarByUserIdService(userId as string, filePath as string);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

export const getDetailUserByIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user?.userId;
  const result = await getDetailUserByIdService(userId as string);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

// --------------------------------------------------------------_ADMIN_----------------------------------------------------------------

export const getAllUserForAdminController = asyncHandler(async (req: AuthRequest, res: any) => {
  const queryOption = req.query;
  const { result, total } = await getAllUserForAdminService(queryOption);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
    total: total,
  };
  return res.status(200).json(response);
});

export const getNewUsersByMonthController = asyncHandler(async (req: AuthRequest, res: any) => {
  const totalUsers = await getNewUsersByMonthService();
  const response: ResponseType<null> = {
    success: true,
    total: totalUsers,
  };
  return res.status(200).json(response);
});

export const getNewUsersTodayController = asyncHandler(async (req: AuthRequest, res: any) => {
  const totalUsers = await getNewUsersTodayService();
  const response: ResponseType<number> = {
    success: true,
    data: totalUsers,
  };
  return res.status(200).json(response);
});

export const getTotalUserController = asyncHandler(async (req: AuthRequest, res: any) => {
  const totalUsers = await getTotalUserService();
  const response: ResponseType<number> = {
    success: true,
    data: totalUsers,
  };
  return res.status(200).json(response);
});

export const getTotalActiveUserController = asyncHandler(async (req: AuthRequest, res: any) => {
  const data = await getTotalActiveUserService();
  const response: ResponseType<typeof data> = {
    success: true,
    data: data,
  };
  return res.status(200).json(response);
});

export const getChurnUserRateController = asyncHandler(async (req: AuthRequest, res: any) => {
  const churnRate = await getChurnUserRateService();
  const response: ResponseType<typeof churnRate> = {
    success: true,
    data: churnRate,
  };
  return res.status(200).json(response);
});

export const getUserGrowthController = asyncHandler(async (req: AuthRequest, res: any) => {
  const queryOption = req.query;
  const result = await getUserGrowthService(queryOption);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

export const userDemographicsController = asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await userDemographicsService();
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

// ----------------------------------------------------------_USER_&&_ADMIN_------------------------------------------------------------
