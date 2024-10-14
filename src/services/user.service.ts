import User from '../models/user';
import Account from '../models/account';
import { AuthRequest } from '../types/AuthRequest.type';

export const getCurrentUserService = async (req: AuthRequest) => {
  console.log(req?.user);
  const user = await User.findById(req?.user?.userId);
  if (!user) {
    throw new Error('User not found');
  }
  const account = await Account.findById(req?.user?._accId);

  const responseData = {
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
