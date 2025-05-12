import mongoose from 'mongoose';
import Conversation from '../models/conversation';
import conversation from '../models/conversation';
import { QueryOption } from '../types/QueryOption.type';
import user from '../models/user';
import { postMessageToConversationService } from './message.service';

export const getConversationsOfUserByUserIdService = async (
  userId: string,
  queryOption: QueryOption,
) => {
  try {
    const page = queryOption?.page || 1;
    const limit = queryOption?.pageSize || 20;
    const skip = (page - 1) * limit;

    // const options = { sort: [['lastMessage?.createdAt', 'asc']] };
    const totalCount = await conversation.countDocuments({
      participants: userId,
      isDeleted: false,
    });
    const result = await conversation
      .find({ participants: userId, isDeleted: false })
      .populate('participants', '_id username avatar status lastOnline')
      .populate({
        path: 'lastMessage',
        select:
          'sender isSeenBy hasText hasFile content fileUrl createdAt isRecalled isDeleted notificationMessage',
        match: { isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar ' })
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
    const createdConversation = await Conversation.create(data);

    const result = await Conversation.findById(createdConversation._id)
      .populate('participants', '_id username avatar status lastOnline')
      .populate({
        path: 'lastMessage',
        select: 'sender isSeenBy hasText hasFile content fileUrl createdAt isRecalled isDeleted',
        match: { isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar' });

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
export const removeMemberService = async (
  userId: string,
  conversationId: string,
  adminId: string,
) => {
  try {
    const foundConversation = await conversation.findById(conversationId);
    if (!foundConversation) {
      throw new Error('Conversation not found');
    }
    if (String(foundConversation.admin) !== adminId) {
      throw new Error('Only the admin can remove members from the conversation');
    }
    const updatedConversation = await conversation.findOneAndUpdate(
      { _id: conversationId },
      { $pull: { participants: userId } },
      { new: true },
    );

    if (!updatedConversation) {
      throw new Error('Failed to remove member from the conversation');
    }
    const admin = await user.findById(adminId);
    const removeUser = await user.findById(userId);
    if (!admin) {
      throw new Error('Admin not found.');
    }
    if (!removeUser) {
      throw new Error('User not found.');
    }
    const newMessage = await postMessageToConversationService({
      sender: adminId,
      conversationId: conversationId,
      content: `${admin.username} kicked ${removeUser.username} from the conversation.`,
      notificationMessage: true,
    });
    await updateLastmessByConversationIdService(conversationId, newMessage._id as string);
    const result = conversation
      .findById(conversationId)
      .populate('participants', '_id username avatar status lastOnline')
      .populate({
        path: 'lastMessage',
        select:
          'sender isSeenBy hasText hasFile content fileUrl createdAt isRecalled isDeleted notificationMessage',
        match: { isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar ' });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const addMemberService = async (
  memberIds: string[],
  conversationId: string,
  addBy: string,
) => {
  try {
    const foundConversation = await conversation.findById(conversationId);
    if (!foundConversation) {
      throw new Error('Conversation not found');
    }

    if (!foundConversation.participants.includes(new mongoose.Types.ObjectId(addBy))) {
      throw new Error('Only participants can add new members to the conversation');
    }

    const updatedConversation = await conversation.findOneAndUpdate(
      { _id: conversationId },
      { $addToSet: { participants: { $each: memberIds } } }, // Avoid duplicates
      { new: true },
    );

    if (!updatedConversation) {
      throw new Error('Failed to add members to the conversation');
    }

    const addByUser = await user.findById(addBy);
    const addedMembers = await user.find({ _id: { $in: memberIds } }, '_id username');

    if (!addByUser) {
      throw new Error('User adding members not found');
    }

    if (!addedMembers.length) {
      throw new Error('No valid members found to add');
    }

    const addedUsernames = addedMembers.map((member) => member.username).join(', ');
    const newMessage = await postMessageToConversationService({
      sender: addBy,
      conversationId: conversationId,
      content: `${addByUser.username} added ${addedUsernames} to the conversation.`,
      notificationMessage: true,
    });

    await updateLastmessByConversationIdService(conversationId, newMessage._id as string);

    const result = await conversation
      .findById(conversationId)
      .populate('participants', '_id username avatar status lastOnline')
      .populate({
        path: 'lastMessage',
        select:
          'sender isSeenBy hasText hasFile content fileUrl createdAt isRecalled isDeleted notificationMessage',
        match: { isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar' });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const leaveGroupChatService = async (userId: string, conversationId: string) => {
  try {
    const findConversation = await conversation.findById(conversationId);
    if (!findConversation) {
      throw new Error('Conversation not found');
    }

    findConversation.participants = findConversation.participants.filter(
      (participant) => participant._id.toString() !== userId,
    );

    if (findConversation.isGroupChat && findConversation?.admin?.toString() === userId) {
      const newAdmin = findConversation.participants[0]?._id;
      findConversation.admin = newAdmin;
    }

    await findConversation.save();

    // Post a message about the user leaving
    const leavingUser = await user.findById(userId);
    const newMessage = await postMessageToConversationService({
      sender: findConversation?.admin?.toString(),
      conversationId: conversationId,
      content: `${leavingUser?.username} has left the group.`,
      notificationMessage: true,
    });

    await updateLastmessByConversationIdService(conversationId, newMessage._id as string);

    const result = await Conversation.findById(conversationId)
      .populate('participants', '_id username avatar status lastOnline')
      .populate({
        path: 'lastMessage',
        select:
          'sender isSeenBy hasText hasFile content fileUrl createdAt isRecalled isDeleted notificationMessage',
        match: { isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar' });

    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Error leaving the group');
  }
};

export const editConversationNameService = async (
  createdBy: string,
  conversationId: string,
  groupName: string,
) => {
  try {
    const findConversation = await conversation.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if the user is the admin
    if (findConversation?.admin?.toString() !== createdBy) {
      throw new Error('Only the admin can change the group name');
    }

    // Update group name
    const updatedConversation = await conversation.findOneAndUpdate(
      { _id: conversationId, admin: createdBy },
      { groupName },
      { new: true },
    );

    if (!updatedConversation) {
      throw new Error('Failed to change group name');
    }

    const addByUser = await user.findById(createdBy);
    const newMessage = await postMessageToConversationService({
      sender: createdBy,
      conversationId: conversationId,
      content: `${addByUser?.username || 'Admin'} changed the group name to "${groupName}".`,
      notificationMessage: true,
    });

    await updateLastmessByConversationIdService(conversationId, newMessage._id as string);

    const result = await conversation
      .findById(conversationId)
      .populate('participants', '_id username avatar status lastOnline')
      .populate({
        path: 'lastMessage',
        select:
          'sender isSeenBy hasText hasFile content fileUrl createdAt isRecalled isDeleted notificationMessage',
        match: { isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar' });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const changeImageGroupChatService = async (
  createdBy: string,
  conversationId: string,
  filePath: string,
) => {
  try {
    const findConversation = await conversation.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if the user is the admin
    if (findConversation?.admin?.toString() !== createdBy) {
      throw new Error('Only the admin can change the group avatar');
    }

    // Update the group avatar
    const updatedConversation = await conversation.findOneAndUpdate(
      { _id: conversationId, admin: createdBy },
      { groupAvatar: filePath },
      { new: true },
    );

    if (!updatedConversation) {
      throw new Error('Failed to change group avatar');
    }

    const addByUser = await user.findById(createdBy);
    const newMessage = await postMessageToConversationService({
      sender: createdBy,
      conversationId: conversationId,
      content: `${addByUser?.username || 'Admin'} changed the group avatar.`,
      notificationMessage: true,
    });

    await updateLastmessByConversationIdService(conversationId, newMessage._id as string);

    const result = await conversation
      .findById(conversationId)
      .populate('participants', '_id username avatar status lastOnline')
      .populate({
        path: 'lastMessage',
        select:
          'sender isSeenBy hasText hasFile content fileUrl createdAt isRecalled isDeleted notificationMessage',
        match: { isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar' });

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const setMemberAsAdminService = async (
  adminId: string,
  conversationId: string,
  memberId: string,
) => {
  try {
    const findConversation = await conversation.findById(conversationId);
    if (!findConversation) {
      throw new Error('Conversation not found');
    }

    if (findConversation?.admin?.toString() !== adminId) {
      throw new Error('Only the admin can set a member as admin');
    }
    const updatedConversation = await conversation.findOneAndUpdate(
      { _id: conversationId, admin: adminId },
      { admin: memberId },
      { new: true },
    );

    if (!updatedConversation) {
      throw new Error('Failed to set member as admin');
    }
    const addByUser = await user.findById(adminId);
    const newAdminUser = await user.findById(memberId);
    if (!addByUser || !newAdminUser) {
      throw new Error('User data not found');
    }
    const newMessage = await postMessageToConversationService({
      sender: adminId,
      conversationId: conversationId,
      content: `${addByUser.username} set ${newAdminUser.username} as the new admin.`,
      notificationMessage: true,
    });

    await updateLastmessByConversationIdService(conversationId, newMessage._id as string);
    const result = await conversation
      .findById(conversationId)
      .populate('participants', '_id username avatar status lastOnline')
      .populate({
        path: 'lastMessage',
        select:
          'sender isSeenBy hasText hasFile content fileUrl createdAt isRecalled isDeleted notificationMessage',
        match: { isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar' });

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

    const newConversation = await conversation.create(data);
    const admin = await user.findById(createdBy);
    if (!admin) {
      throw new Error('Admin not found.');
    }

    const newMessage = await postMessageToConversationService({
      sender: createdBy,
      conversationId: newConversation._id,
      content: `${admin.username} created ${groupName}.`,
      notificationMessage: true,
    });
    await updateLastmessByConversationIdService(
      newConversation._id.toString(),
      newMessage._id as string,
    );
    const result = await conversation
      .findById(newConversation._id)
      .populate('participants', '_id username avatar status lastOnline')
      .populate({
        path: 'lastMessage',
        select:
          'sender isSeenBy hasText hasFile content fileUrl createdAt isRecalled isDeleted notificationMessage',
        match: { isDeleted: false },
        populate: { path: 'sender', select: '_id username avatar' },
      })
      .populate({ path: 'createdBy', select: '_id username avatar ' })
      .lean();
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'An error occurred while creating the group chat.');
  }
};
