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

export const getAllFriendsOfUserService = async (data: any) => {
  try {
    const { userId, limit = 20, skip } = data;

    const friends = await Friend.find({
      $or: [{ sendBy: userId }, { receiver: userId }],
      status: EnumFriend.TYPE_ACCEPT,
    });
    // Tạo danh sách các friend IDs từ các bản ghi tìm được
    const friendIDs = friends.map((Friend) =>
      Friend.sendBy.toString() === userId.toString() ? Friend.receiver : Friend.sendBy,
    );
    console.log(friendIDs);
    // Phân trang khi tìm user từ danh sách friend IDs
    const friendUsers = await User.find({ _id: { $in: friendIDs } })
      .skip(skip)
      .limit(limit);
    console.log(friendUsers);
    return friendUsers;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
