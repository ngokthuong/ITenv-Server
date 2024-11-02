import User from '../models/user';
import Account from '../models/account';
import { AuthRequest } from '../types/AuthRequest.type';
import Friend from '../models/friend';
import { EnumFriend } from '../enums/schemaFriend.enum';

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

export const findUserById = async (userId: string) => {
  try {
    const currentUser = User.findById(userId);
    return currentUser;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllUsersService = async (
  pageNumber: number,
  limitNumber: number,
  search: string,
) => {
  const searchQuery = search
    ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }
    : {};

  const users = await User.find(searchQuery)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

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
      ...statusCondition
    });
    // Tạo danh sách các friend IDs từ các bản ghi tìm được
    const friendIDs = friends.map(Friend =>
      Friend.sendBy.toString() === userId.toString() ? Friend.receiver : Friend.sendBy
    );
    // Phân trang khi tìm user từ danh sách friend IDs
    const friendUsers = await User.find({ _id: { $in: friendIDs } })
      .skip(skip)
      .limit(limit);
    return friendUsers;

  } catch (error: any) {
    throw new Error(error.message)
  }
}


export const getUsersForFriendPageService = async (userId: string, page: number, pageSize: number) => {
  const limit = pageSize
  const skip = (page - 1) * limit;
  const { users } = await getAllUsersService(page, limit, '');
  const usersWithFriends = await Promise.all(
    users.map(async (user) => {
      const friends = await getAllFriendsOfUserByTypeService({
        userId: user._id,
        limit,
        skip,
        type: EnumFriend.TYPE_ACCEPT,
      });
      return {
        ...user.toObject(),
        friends,
      };
    })
  );
  // tim trang thai cua user xem da ket ban voi nguoi su dung hien tai chua
  const result = await Promise.all(
    usersWithFriends.map(async (user) => {
      const friendWithMe = await Friend.findOne({
        $or: [
          { sendBy: userId, receiver: user._id },
          { sendBy: user._id, receiver: userId }
        ]
      });
      return {
        ...user,
        friendWithMe
      };
    })
  )
  return result;
}