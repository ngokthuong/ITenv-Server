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
  const friends = await Friend.find({
    $or: [{ sendBy: user._id }, { receiver: user._id }],
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
    friends,
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
    .limit(limitNumber)
    .lean();

  const userWithFriends = await Promise.all(
    users.map(async (user) => {
      const friends = await Friend.find({
        $or: [{ sendBy: user._id }, { receiver: user._id }],
        status: EnumFriend.TYPE_ACCEPT,
      });

      const formattedFriends = await Promise.all(
        friends.map(async (friend) => {
          const isSender = friend.sendBy.toString() === user._id.toString();
          const friendId = isSender ? friend.receiver : friend.sendBy;
          const friendDetails = await User.findById(friendId).select('avatar username _id');
          return friendDetails;
        }),
      );

      return { ...user, friends: formattedFriends };
    }),
  );
  const total = await User.countDocuments(searchQuery);

  return { total, users: userWithFriends };
};

//  get all friends

//  friends:{
// 	total : 100
// 	friends : [limit 5]
// } [
//      {
//                     "_id": "66fb8b527c1e17e7cd859266",
//                     "username": "tranduongthieu",
//                     "avatar": "https://res.cloudinary.com/dcti265mg/image/upload/v1725036493/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper_xa2b6h.png"
//                 }
//             ]

export const getAllFriendsOfUserService = async (data: any) => {
  try {
    //type =
    const { userId, limit = 20, skip, type } = data;
    const statusCondition = type === 'ALL' ? {} : { status: type };
    const friends = await Friend.find({
      $or: [{ sendBy: userId }, { receiver: userId }],
      ...statusCondition,
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
