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
  let { receiver, content, conversationId, hasFile, hasText, parentMessage } = messageInfo;
  const sender = user._id.toString();
  const recieverArray = Array.isArray(receiver) ? receiver : [receiver || ''];
  recieverArray.push(sender || '');
  let conversation;
  try {
    console.log('message socket', messageInfo);
    if (!(await findConversationByIdService(conversationId!))) {
      // create conversation
      conversation = await createConversationForTwoPeopleByUserService(sender, recieverArray);
      conversationId = conversation._id.toString();
    } else conversation = await findConversationByIdService(conversationId!);
    const newMess = await postMessageToConversationService({
      sender,
      conversationId,
      hasFile,
      hasText,
      //  fileUrl,
      content,
      parentMessage,
      isSeenBy: [sender],
    });
    const findNewMess = await message
      .findById(newMess._id)
      .populate('sender', '_id username avatar')
      .lean();
    await updateLastmessByConversationIdService(conversationId!, newMess?._id as string);
    conversation?.participants?.forEach((participant) => {
      console.log(participant._id.toString());
      socket.to(participant._id.toString()).emit('message', {
        data: findNewMess,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const seenMessage = async (socket: Socket, user: IUser, messageInfo: IMessage) => {
  try {
    console.log(messageInfo);
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
