import { Socket } from 'socket.io';
import { IUser } from '../models/user';
import { MessageRequestType } from '../types/MessageRequestType';
import {
  createConversationForTwoPeopleByUserService,
  findConversationByIdService,
  updateLastmessByConversationIdService,
} from '../services/conversation.service';
import {
  postMessageToConversationService,
  seenMessageByUserIdService,
} from '../services/message.service';
import message, { IMessage } from '../models/message';
import conversation from '../models/conversation';

export const messageSocket = async (
  socket: Socket,
  user: IUser,
  messageInfo: MessageRequestType,
) => {
  try {
    const conversation = await findConversationByIdService(messageInfo?.conversationId!);
    conversation?.participants?.forEach((participant) => {
      console.log(participant._id.toString());
      socket.to(participant._id.toString()).emit('message', {
        data: messageInfo,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const seenMessage = async (socket: Socket, user: IUser, messageInfo: IMessage) => {
  try {
    if (user?._id && messageInfo?._id) {
      const messageAfterSeen = await seenMessageByUserIdService(
        user?._id?.toString() || '',
        messageInfo?._id?.toString(),
      );
      const get_conversation = await conversation.findById(messageInfo.conversationId);
      get_conversation?.participants?.forEach((participant) => {
        socket.to(participant._id.toString()).emit('seen_message', messageAfterSeen);
      });
    }
  } catch (error) {
    console.log(error);
  }
};
export const recallMessage = async (socket: Socket, user: IUser, messageInfo: IMessage) => {
  try {
    const get_conversation = await conversation.findById(messageInfo.conversationId);
    get_conversation?.participants?.forEach((participant) => {
      socket.to(participant._id.toString()).emit('recall_message', messageInfo);
    });
  } catch (error) {
    console.log(error);
  }
};
