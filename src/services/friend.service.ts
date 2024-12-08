import { EnumFriend } from '../enums/schemaFriend.enum';
import conversation from '../models/conversation';
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
    const friendRequest = await friend.create(data);
    const populatedFriendRequest = await friend
      .findById(friendRequest._id)
      .populate({ path: 'sendBy receiver', select: '_id username avatar' });

    return populatedFriendRequest;
  } catch (error: any) {
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
};

const updateFriendRequestExistedService = async (sendBy: string, receiver: string) => {
  try {
    const result = await friend
      .findOneAndUpdate(
        {
          $or: [
            { sendBy, receiver },
            { sendBy: receiver, receiver: sendBy },
          ],
        },
        {
          isDeleted: false,
          sendBy,
          receiver,
          status: EnumFriend.TYPE_PENDING,
          createdAt: new Date(),
        },
        { new: true },
      )
      .populate('receiver sendBy', '_id username avatar');
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
    const friendRequest = await friend
      .findOneAndUpdate(
        {
          _id: _id,
          $or: [{ sendBy: userId }, { receiver: userId }],
        },
        {
          status: EnumFriend.TYPE_ACCEPT,
          acceptedAt: new Date(),
        },
        { new: true },
      )
      .populate('sendBy receiver', '_id username avatar');
    if (friendRequest) return friendRequest;
    else return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const rejectFriendRequestService = async (friendId: string, userId: string) => {
  try {
    return await friend.findOneAndUpdate(
      {
        _id: friendId,
        $or: [{ sendBy: userId }, { receiver: userId }],
      },
      { isDeleted: true },
      { new: true },
    );
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

export const getFriendsByUserIdService = async (userId: string, queryOption: QueryOption) => {
  try {
    const { page = 1, pageSize = 10, search } = queryOption;

    // Build search filter for friends
    const searchFilter = search
      ? {
          $or: [
            { 'sendBy.username': { $regex: search, $options: 'i' } },
            { 'receiver.username': { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    // Fetch friends with pagination and search
    const friends = await friend
      .find({
        $or: [{ sendBy: userId }, { receiver: userId }],
        status: EnumFriend.TYPE_ACCEPT,
        isDeleted: false,
        ...searchFilter,
      })
      .populate({
        path: 'sendBy receiver',
        select: '_id username avatar',
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    // Total count for pagination
    const total = await friend.countDocuments({
      $or: [{ sendBy: userId }, { receiver: userId }],
      status: EnumFriend.TYPE_ACCEPT,
      isDeleted: false,
      ...searchFilter,
    });

    return { friends, total };
  } catch (error) {
    return { friends: [], total: 0 };
  }
};

export const getFriendsOutsiteGroupChatService = async (
  userId: string,
  conversationId: string,
  queryOption: QueryOption,
) => {
  try {
    const { page = 1, pageSize = 10, search } = queryOption;

    const findConversation = await conversation.findById(conversationId).select('participants');
    if (!findConversation) {
      throw new Error('Conversation not found');
    }

    const groupParticipants = findConversation.participants.map((participant: any) =>
      participant.toString(),
    );

    const searchFilter = search
      ? {
          $or: [
            { 'sendBy.username': { $regex: search, $options: 'i' } },
            { 'receiver.username': { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const friends = await friend
      .find({
        $or: [{ sendBy: userId }, { receiver: userId }],
        status: EnumFriend.TYPE_ACCEPT,
        isDeleted: false,
        ...searchFilter,
      })
      .populate({
        path: 'sendBy receiver',
        select: '_id username avatar',
      });

    const filteredFriends = friends.filter(
      (f) =>
        (f.sendBy && !groupParticipants.includes(f.sendBy._id.toString())) ||
        (f.receiver && !groupParticipants.includes(f.receiver._id.toString())),
    );
    const paginatedFriends = filteredFriends.slice((page - 1) * pageSize, page * pageSize);

    return { friends: paginatedFriends, total: filteredFriends.length };
  } catch (error: any) {
    console.error(error.message);
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
    const search = queryOption?.search || '';
    const sortField = 'createdAt';
    const skip = (page - 1) * limit;
    const result = await friend
      .find({ receiver, status: EnumFriend.TYPE_PENDING, isDeleted: false })
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'sendBy receiver', select: '_id username avatar' })
      .lean();
    const total = await friend.countDocuments({
      receiver,
      status: EnumFriend.TYPE_PENDING,
      isDeleted: false,
    });
    return { result, total };
  } catch (error: any) {
    throw new Error(error.message);
  }
};
