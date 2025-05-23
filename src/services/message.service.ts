import conversation from '../models/conversation';
import message from '../models/message';
import { QueryOption } from '../types/QueryOption.type';
import {
  createConversationForTwoPeopleByUserService,
  findConversationByIdService,
  updateLastmessByConversationIdService,
} from './conversation.service';

export const postMessageToConversationService = async (data: any) => {
  try {
    const conversation = await findConversationByIdService(data.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found.');
    }
    if (conversation.participants.includes(data.sender))
      return (await message.create(data)).populate('sender', '_id username avatar');
    else throw new Error('You are not a member in this conversation.');
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllMesssOfCvssByCvssIdService = async (
  conversationId: string,
  queryOption: QueryOption,
) => {
  try {
    const page = queryOption?.page || 1;
    const limit = queryOption?.pageSize || 20;
    const sortField = queryOption.sortField || 'createdAt';
    const sortOrder = queryOption.sortOrder || 'DESC';
    const skip = (page - 1) * limit;
    const search = queryOption?.search || '';

    if (!conversationId) {
      throw new Error('Conversation ID is required.');
    }

    const result = await message
      .find({
        content: { $regex: search, $options: 'i' },
        conversationId,
        isDeleted: false,
      })
      .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', '_id username avatar')
      .lean();

    const total = await message.countDocuments({
      content: { $regex: search, $options: 'i' },
      conversationId,
      isDeleted: false,
    });
    return { result: result.reverse(), total };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const addMessForConvertationByUserIdService = async (
  data: any,
  sender: string,
  fileUrl?: string[],
) => {
  try {
    let {
      receiver,
      content,
      conversationId,
      hasFile,
      hasText,
      hasCodeFile,
      fileName,
      parentMessage,
    } = data;

    const recieverArray = Array.isArray(receiver) ? receiver : [receiver];
    let getConversation = null;
    if (!conversationId) {
      const findConversation = await conversation.findOne({
        participants: { $all: [sender, ...recieverArray] },
        isGroupChat: false,
        isDeleted: false,
      });

      if (!findConversation) {
        const result = await createConversationForTwoPeopleByUserService(sender, [
          ...recieverArray,
          sender,
        ]);
        getConversation = result;
        conversationId = result?._id?.toString();
      } else {
        conversationId = findConversation?._id.toString()!;
      }
    }

    const newMess = await postMessageToConversationService({
      sender,
      conversationId,
      hasFile,
      hasText,
      hasCodeFile,
      fileName,
      fileUrl,
      content,
      parentMessage,
      isSeenBy: [sender],
    });
    await updateLastmessByConversationIdService(conversationId, newMess._id as string);
    const conversationObject = getConversation ? getConversation.toObject() : null;
    const newMessObject = newMess.toObject();
    return { ...newMessObject, conversation: conversationObject };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const recalledMessageBySenderService = async (sender: string, messId: string) => {
  try {
    return await message.findOneAndUpdate(
      { sender, _id: messId },
      { isRecalled: true },
      { new: true },
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const seenMessageByUserIdService = async (userId: string, messageId: string) => {
  try {
    const result = await message.findByIdAndUpdate(
      messageId,
      { $addToSet: { isSeenBy: userId } },
      { new: true },
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getMyConversationWithUserService = async (
  currentUserId: string,
  userId: string,
  queryOption: QueryOption,
) => {
  try {
    const conv = await conversation.findOne({
      participants: { $all: [currentUserId, userId] },
      isGroupChat: false,
      isDeleted: false,
    });
    if (conv) {
      const result = await getAllMesssOfCvssByCvssIdService(conv._id.toString(), queryOption);
      return result;
    } else return null;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
