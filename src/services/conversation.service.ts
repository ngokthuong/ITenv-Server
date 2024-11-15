import mongoose from 'mongoose';
import Conversation from '../models/conversation';
import conversation from '../models/conversation';
import { QueryOption } from '../types/QueryOption.type';
import user from '../models/user';

export const getConversationsOfUserByUserIdService = async (
  userId: string,
  queryOption: QueryOption,
) => {
  try {
    const page = queryOption?.page || 1;
    const limit = queryOption?.pageSize || 20;
    const sortField = queryOption.sortField || 'createdAt';
    const sortOrder = 'ASC';
    const skip = (page - 1) * limit;
    const options = { sort: [['lastMessage?.createdAt', 'asc']] };
    const totalCount = await conversation.countDocuments({ participants: userId });
    const result = await conversation
      .find({ participants: userId, isDeleted: false })
      .populate('participants', '_id username avatar')
      .populate({
        path: 'lastMessage',
        select: 'sender isSeenBy hasText hasFile content fileUrl createdAt',
        match: { isRecalled: false, isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar' })
      .skip(skip)
      .limit(limit)
      .lean();

    result.sort((a, b) => {
      const dateA = (a.lastMessage as any)?.createdAt || new Date(0);
      const dateB = (b.lastMessage as any)?.createdAt || new Date(0);
      return dateB - dateA;
    });
    return { result, totalCount };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const checkListFriendService = async (listFriendId: string[]) => {
  const result = await user.find({ _id: { $in: listFriendId } });
  return result.length >= 2;
};

export const findConversationByIdService = async (conversationId: string) => {
  try {
    const result = await Conversation.findById(conversationId);
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// two people
export const createConversationForTwoPeopleByUserService = async (
  createdBy: string,
  participantId: string[],
) => {
  try {
    const data = {
      createdBy,
      participants: participantId,
      isGroupChat: false,
    };
    const result = await Conversation.create(data);
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateLastmessByConversationIdService = async (
  conversationId: string,
  lastMessageId: string,
) => {
  try {
    const result = await conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: lastMessageId },
      { new: true },
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const editConversationNameService = async (
  createdBy: string,
  conversationId: string,
  groupName: string,
) => {
  try {
    const result = await conversation.findOneAndUpdate(
      { _id: conversationId, createdBy },
      { groupName },
      { new: true },
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createGroupChatService = async (
  createdBy: string,
  participants: string[],
  groupName: string,
) => {
  try {
    if (!(await checkListFriendService(participants))) {
      throw new Error('At least 3 people');
    }
    if (participants.includes(createdBy)) {
      throw new Error('Validation failed, createdBy existed');
    }
    participants.push(createdBy);
    const data = {
      createdBy: createdBy,
      participants: participants,
      isGroupChat: true,
      groupName,
    };
    const result = await conversation.create(data);
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
