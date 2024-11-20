import User from '../models/user';
import Account from '../models/account';
import { AuthRequest } from '../types/AuthRequest.type';
import Friend from '../models/friend';
import { EnumFriend } from '../enums/schemaFriend.enum';
import { QueryOption } from '../types/QueryOption.type';
import { getInfoData } from '../utils/getInfoData.utils';
import user from '../models/user';

export const getCurrentUserService = async (req: AuthRequest) => {
  const user = await User.findById(req?.user?.userId);
  if (!user) {
    throw new Error('User not found');
  }
  const account = await Account.findById(req?.user?._accId);

  const responseData = {
    _id: user._id,
    username: user.username,
    dob: user.dob,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    gender: user.gender,
    status: user.status,
    lastOnline: user.lastOnline,
    email: account?.email,
    role: account?.role,
    isBlocked: account?.isBlocked,
  };

  return responseData;
};

export const findUserByIdService = async (userId: string) => {
  try {
    const currentUser = User.findOne({ _id: userId, isDeleted: false });
    return currentUser;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllUsersService = async (queryOption: QueryOption) => {
  const search = queryOption.search || '';
  const page = queryOption.page || 1;
  const pageSize = queryOption.pageSize || 20;

  // Define the search query based on the search term
  const searchQuery = search
    ? {
      $and: [
        { isDeleted: false },
        {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        },
      ],
    }
    : { isDeleted: false };

  // Find users with pagination
  const users = await User.find(searchQuery)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  // Get the total count of users matching the search criteria
  const total = await User.countDocuments(searchQuery);

  return { total, users };
};

//  get all friends

export const getAllFriendsOfUserByTypeService = async (data: any) => {
  try {
    const { userId, limit, skip, type } = data;
    //
    const statusCondition = type === 'ALL' ? {} : { status: type };
    const friends = await Friend.find({
      $or: [{ sendBy: userId }, { receiver: userId }],
      isDeleted: false,
      ...statusCondition,
    });
    // const total = await Friend.countDocuments({ receiver: userId, ...statusCondition });
    // Tạo danh sách các friend IDs từ các bản ghi tìm được
    const friendIDs = friends.map((Friend) =>
      Friend.sendBy.toString() === userId.toString() ? Friend.receiver : Friend.sendBy,
    );
    // Phân trang khi tìm user từ danh sách friend IDs
    const friendUsers = await User.find({ _id: { $in: friendIDs } })
      .skip(skip)
      .limit(limit);
    return friendUsers;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUsersForFriendPageService = async (
  userId: string,
  queryOption: QueryOption
) => {
  const page = queryOption.page || 1;
  const pageSize = queryOption.pageSize || 20;
  const search = queryOption.search || ''
  const limit = pageSize;
  const skip = (page - 1) * limit;
  const { users } = await getAllUsersService({ page, pageSize, search });
  const result = await Promise.all(
    users.map(async (user) => {
      const friends = await getAllFriendsOfUserByTypeService({
        userId: user._id,
        limit,
        skip,
        type: EnumFriend.TYPE_ACCEPT,
      });

      const friendWithMe = await Friend.findOne({
        $and: [
          {
            $or: [
              { sendBy: userId, receiver: user._id },
              { sendBy: user._id, receiver: userId },
            ]
          },
          { isDeleted: false }
        ]
      });

      return {
        ...user,
        friends,
        friendWithMe,
      };
    }),
  );
  return result;
};

export const getUserByIdService = async (userId: string, currentUserId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const account = await Account.findOne({ user: userId, isDeleted: false });
  const friendWithMe = await Friend.findOne({
    $and: [
      {
        $or: [
          { sendBy: currentUserId, receiver: user._id },
          { sendBy: user._id, receiver: currentUserId },
        ],
      },
      { isDeleted: false },
    ],
  });
  const responseData = {
    _id: user._id,
    username: user.username,
    dob: user.dob,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    gender: user.gender,
    status: user.status,
    lastOnline: user.lastOnline,
    email: account?.email,
    role: account?.role,
    isBlocked: account?.isBlocked,
    friendWithMe,
  };

  return responseData;
};

export const getAllUserForAdminService = async (queryOption: QueryOption) => {
  try {
    const search = queryOption.search || '';
    const page = queryOption.page || 1;
    const pageSize = queryOption.pageSize || 20;
    const sortField = queryOption.sortField || 'createdAt';
    const sortOrder = queryOption.sortOrder || 'asc';

    const result = await User.find({
      username: { $regex: search, $options: 'i' },
    })
      .populate('Account', 'email password passwordChangeAt')
      .sort({
        [sortField]: sortOrder === 'asc' ? 1 : -1,
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const total = await User.countDocuments();

    return { total, result };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const editProfileByUserIdService = async (data: any, userId: string) => {
  try {
    const result = await User.findByIdAndUpdate(
      { _id: userId },
      {
        username: data.username,
        dob: data.dob,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
      },
      { new: true },
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const editAvatarByUserIdService = async (_id: string, avatar: string) => {
  try {
    // viet ham get u lieu phu hop
    const result = await User.findByIdAndUpdate({ _id }, { avatar }, { new: true });
    return {
      ...getInfoData({ fileds: ['avatar'], object: result }),
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getDetailUserByIdService = async (_id: string) => {
  try {
    const result = await User.findOne({ _id, isDeleted: false });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};


// --------------------------------------------------------ADMIN------------------------------------------------------------------------
export const getNewUsersByMonthService = async () => {
  try {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const result = await user.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      }, isDeleted: false
    });
    return result;
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getNewUsersTodayService = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await user.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};


export const getTotalUserService = async () => {
  try {
    const total = await user.countDocuments({})
    return total;
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getTotalActiveUserService = async () => {
  try {
    const total = await user.countDocuments({ status: true })
    return total;
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getChurnUserRateService = async () => {
  try {
    const allUser = await user.find({ status: true });
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const churnUsers = await User.find({
      lastOnline: { $lt: twoMonthsAgo },
    });

    const churnUserCount = churnUsers.length;

    const result = Math.round((churnUserCount / allUser.length) * 100);
    return `${result}%`;
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getUserGrowthService = async (queryOption: QueryOption) => {
  try {
    const year = queryOption.year || new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, index) => index + 1);
    let results = [];

    for (const month of months) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      const total = await getUserGrowthServiceByMonth(startOfMonth, endOfMonth);
      results.push({ month, total });
    }
    return results;
  } catch (error: any) {
    throw new Error(error.message)
  }
}

const getUserGrowthServiceByMonth = async (startOfMonth: Date, endOfMonth: Date) => {
  try {
    const result = await user.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    })
    return result;
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const userDemographicsService = async () => {
  try {
    const users = await user.find({})

    let ageGroups = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    };

    users.forEach(async (user) => {
      if (user.dob) {
        const age = await calculateAge(user.dob);
        if (age >= 18 && age <= 24) {
          ageGroups['18-24']++;
        } else if (age >= 25 && age <= 34) {
          ageGroups['25-34']++;
        } else if (age >= 35 && age <= 44) {
          ageGroups['35-44']++;
        } else if (age >= 45 && age <= 54) {
          ageGroups['45-54']++;
        } else if (age >= 55) {
          ageGroups['55+']++;
        }
      }
    });

    return ageGroups;
  } catch (error: any) {

  }
}


const calculateAge = async (dob: Date) => {
  try {
    const today = new Date();
    const birthDate = dob;
    let age = today.getFullYear() - birthDate.getFullYear();
    const findMonth = today.getMonth() - birthDate.getMonth();
    if (findMonth < 0 || (findMonth === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (error: any) {
    throw new Error(error.message)
  }
}