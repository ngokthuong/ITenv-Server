import { EnumFriend } from '../enums/schemaFriend.enum';
import friend from '../models/friend';
import { QueryOption } from '../types/QueryOption.type';

export const createFriendRequest = async (data: any) => {
  try {
    const { sendBy, receiver } = data;
    // check friend exist
    if ((await checkFriendRequestExisted(sendBy, receiver)))
      throw new Error('Friend request existed!')
    // check firend request to myself
    if ((await checkFriendRequestToMyself(sendBy, receiver)))
      throw new Error('Friend request not send to myself!')
    return await friend.create(data);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const checkFriendRequestToMyself = async (sendBy: string, receiver: string) => {
  try {
    if (sendBy === receiver)
      return true
    return false
  } catch (error: any) {
    throw new Error(error.message)
  }
}

const checkFriendRequestExisted = async (sendBy: string, receiver: string) => {
  try {
    const result = await friend.findOne({ sendBy, receiver });
    if (result)
      return true
    return false
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const acceptFriendRequestService = async (_id: string, userId: string) => {
  try {
    return await friend.findOneAndUpdate(
      {
        _id: _id,
        $or: [{ sendBy: userId }, { receiver: userId }],
      },
      {
        status: EnumFriend.TYPE_ACCEPT,
        acceptedAt: new Date(),
      },
      { new: true },
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const rejectFriendRequestService = async (_id: string, userId: string) => {
  try {
    return await friend.findOneAndDelete({
      _id: _id,
      $or: [{ sendBy: userId }, { receiver: userId }],
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const blockFriendRequestService = async (_id: string, blockBy: string) => {
  try {
    return await friend.findOneAndUpdate(
      {
        _id: _id,
        $or: [{ sendBy: blockBy }, { receiver: blockBy }],
      },
      { isBlockBy: blockBy, status: EnumFriend.TYPE_BLOCKED },
      { new: true },
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getFriendsByUserIdService = async (userId: string) => {
  try {
    const friends = await friend
      .find({
        $or: [{ sendBy: userId }, { receiver: userId }],
        status: EnumFriend.TYPE_ACCEPT,
      })
      .populate({
        path: 'sendBy receiver',
        select: '_id username avatar',
      });
    const total = await friend.countDocuments({
      $or: [{ sendBy: userId }, { receiver: userId }],
      status: EnumFriend.TYPE_ACCEPT,
    });
    return { friends, total };
  } catch (error) {
    return { friends: [], total: 0 };
  }
};

export const getFriendRequestByUserIdService = async (
  receiver: string,
  queryOption: QueryOption,
) => {
  try {
    const page = queryOption?.page || 1;
    const limit = 20;
    const sortField = 'createdAt';
    const skip = (page - 1) * limit;
    const result = await friend
      .find({ receiver, status: EnumFriend.TYPE_PENDING })
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'sendBy receiver', select: '_id username avatar' })
      .lean();
    const total = await friend.countDocuments({ receiver, status: EnumFriend.TYPE_PENDING });
    return { result, total };
  } catch (error: any) {
    throw new Error(error.message);
  }
};
