import User from '../models/user';
import Account from '../models/account';
import { AuthRequest } from '../types/AuthRequest.type';
import Friend from '../models/friend';
import { EnumFriend } from '../enums/schemaFriend.enum';
import { QueryOption } from '../types/QueryOption.type';
import { getInfoData } from '../utils/getInfoData.utils';

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
      ...statusCondition,
      isdeleted: false,
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
  page: number,
  pageSize: number,
) => {
  const limit = pageSize;
  const skip = (page - 1) * limit;
  const { users } = await getAllUsersService({ page, pageSize });
  const result = await Promise.all(
    users.map(async (user) => {
      const friends = await getAllFriendsOfUserByTypeService({
        userId: user._id,
        limit,
        skip,
        type: EnumFriend.TYPE_ACCEPT,
      });

      const friendWithMe = await Friend.findOne({
        $or: [
          { sendBy: userId, receiver: user._id },
          { sendBy: user._id, receiver: userId },
        ],
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

export const getUserByIdService = async (userId: string, currentUserId :string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const account = await Account.findOne({ user: userId });
  const friendWithMe = await Friend.findOne({
    $or: [
      { sendBy: currentUserId, receiver: user._id },
      { sendBy: user._id, receiver: currentUserId },
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
    const result = await User.findById(_id);
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
