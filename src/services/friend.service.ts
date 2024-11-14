import { EnumFriend } from '../enums/schemaFriend.enum';
import friend from '../models/friend';
import { QueryOption } from '../types/QueryOption.type';

export const createFriendRequest = async (data: any) => {
  try {
    const { sendBy, receiver } = data;

    // Kiểm tra xem lời mời kết bạn đã tồn tại chưa
    const existingFriendRequest = await checkFriendRequestExisted(sendBy, receiver);
    if (existingFriendRequest) {
      // Nếu lời mời đã bị xóa mềm, cập nhật lại trạng thái
      if (existingFriendRequest.isDeleted) {
        return await updateFriendRequestExistedService(sendBy, receiver);
      } else {
        // Nếu lời mời vẫn tồn tại và chưa bị xóa, không cho phép tạo lại
        throw new Error('Friend request already exists!');
      }
    }

    // Kiểm tra lời mời kết bạn đến chính mình
    if (await checkFriendRequestToMyself(sendBy, receiver)) {
      throw new Error('Cannot send a friend request to yourself!');
    }

    // Tạo lời mời kết bạn mới
    return await friend.create(data);
  } catch (error: any) {
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
};

const updateFriendRequestExistedService = async (sendBy: string, receiver: string) => {
  try {
    const result = await friend.findOneAndUpdate(
      {
        $or: [
          { sendBy, receiver },
          { sendBy: receiver, receiver: sendBy },
        ],
      },
      { isdeleted: false, sendBy, receiver },
      { new: true },
    );
    return result;
  } catch (error: any) {
    throw new Error('Failed to update friend request');
  }
};

const checkFriendRequestExisted = async (sendBy: string, receiver: string) => {
  try {
    const result = await friend.findOne({
      $or: [
        { sendBy, receiver },
        { sendBy: receiver, receiver: sendBy },
      ],
    });
    return result;
  } catch (error: any) {
    throw new Error('Failed to check existing friend request');
  }
};

const checkFriendRequestToMyself = async (sendBy: string, receiver: string) => {
  try {
    if (sendBy === receiver) return true;
    return false;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

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

export const rejectFriendRequestService = async (friendId: string, userId: string) => {
  try {
    return await friend.findOneAndUpdate({
      _id: friendId,
      $or: [{ sendBy: userId }, { receiver: userId }],
    }, { isdeleted: true }, { new: true });
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
        isDeleted: false
      })
      .populate({
        path: 'sendBy receiver',
        select: '_id username avatar',
      });
    const total = await friend.countDocuments({
      $or: [{ sendBy: userId }, { receiver: userId }],
      status: EnumFriend.TYPE_ACCEPT,
      isdeleted: false,
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
