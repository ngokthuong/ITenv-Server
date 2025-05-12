import { Socket } from 'socket.io';
import { IUser } from '../models/user';
import { MessageRequestType } from '../types/MessageRequestType';
import { findConversationByIdService } from '../services/conversation.service';
import { seenMessageByUserIdService } from '../services/message.service';
import { IMessage } from '../models/message';
import conversation from '../models/conversation';
import notification from '../models/notification';
import { NotificationTypeEnum } from '../enums/notification.enum';

export const messageSocket = async (
  socket: Socket,
  user: IUser,
  messageInfo: MessageRequestType,
) => {
  try {
    const conversation = await findConversationByIdService(messageInfo?.conversationId!);
    conversation?.participants?.forEach((participant) => {
      socket.to(participant._id.toString()).emit('message', {
        data: messageInfo,
      });
    });
  } catch (error) {
    throw new Error('Error in message socket: ' + error);
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
    throw new Error('Error in seen message socket: ' + error);
  }
};
export const recallMessage = async (socket: Socket, user: IUser, messageInfo: IMessage) => {
  try {
    const get_conversation = await conversation.findById(messageInfo.conversationId);
    get_conversation?.participants?.forEach((participant) => {
      socket.to(participant._id.toString()).emit('recall_message', messageInfo);
    });
  } catch (error) {
    throw new Error('Error in recall message socket: ' + error);
  }
};

export const createGroupChat = async (socket: Socket, user: IUser, conversation: any) => {
  conversation.participants?.forEach((participant: any) => {
    socket.to(participant._id.toString()).emit('create_group', conversation);
  });
};

export const removeMemberFromGroupChat = async (
  socket: Socket,
  user: IUser,
  data: { conversation: any; memberId: string },
) => {
  data.conversation.participants?.forEach((participant: any) => {
    socket.to(participant._id.toString()).emit('remove_member', data);
  });
  const newNotification = new notification({
    postedBy: user._id,
    notificationType: NotificationTypeEnum.OTHER_NOTIFICATION,
    content: `${user.username} kicked you from ${data.conversation.groupName}.`,
    receivers: [data.memberId],
  });
  await newNotification.save();
  socket.to(data.memberId).emit('receive_notification', newNotification);
};
export const addMemberToGroupChat = async (
  socket: Socket,
  user: IUser,
  data: { conversation: any; memberIds: string[] },
) => {
  data.conversation.participants?.forEach((participant: any) => {
    socket.to(participant._id.toString()).emit('add_member', data);
  });
};

export const updateConversation = async (socket: Socket, user: IUser, conversation: any) => {
  conversation.participants?.forEach((participant: any) => {
    socket.to(participant._id.toString()).emit('update_conversation', conversation);
  });
};
