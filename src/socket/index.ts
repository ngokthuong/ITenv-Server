import { Socket } from 'socket.io';
import uploader, { cloudinaryConfig } from '../config/cloudinary';
import { IMessage } from '../models/message';
import { IUser } from '../models/user';
import {
  addMemberToGroupChat,
  createGroupChat,
  messageSocket,
  recallMessage,
  removeMemberFromGroupChat,
  seenMessage,
  updateConversation,
} from './message.socket';
import { notifySocket } from './notification.socket';
import { acceptFriendSocket, createFriendRequestSocket } from './friend.socket';
export const socketFunctions = (socket: Socket, user: IUser) => {
  // socket.use(async (packet, next) => {
  //   const [eventName, messageInfo] = packet;

  //   if (eventName === 'message' && messageInfo.file) {
  //     try {
  //       const uploadedFiles = await Promise.all(
  //         messageInfo.file.map(async (file: { name: string; path: string }) => {
  //           const uploadResponse = cloudinaryConfig.uploader.upload(file.path);
  //           return uploadResponse;
  //         }),
  //       );
  //       messageInfo.fileUrl = uploadedFiles.map(file=>file.url);
  //       delete messageInfo.file;
  //       console.log(messageInfo)
  //     } catch (error) {
  //       console.error('File upload failed:', error);
  //       return next(new Error('File upload failed'));
  //     }
  //   }

  //   next();
  // });
  socket.on('notify', async (notificationReq) => await notifySocket(socket, user, notificationReq));
  socket.on('message', async (messageInfo) => await messageSocket(socket, user, messageInfo));
  socket.on(
    'seen_message',
    async (messageInfo: IMessage) => await seenMessage(socket, user, messageInfo),
  );
  socket.on(
    'recall_message',
    async (messageInfo: IMessage) => await recallMessage(socket, user, messageInfo),
  );
  socket.on('accept_friend', async (friend) => await acceptFriendSocket(socket, user, friend));
  socket.on('add_friend', async (friend) => await createFriendRequestSocket(socket, user, friend));
  socket.on(
    'create_group',
    async (conversation: any) => await createGroupChat(socket, user, conversation),
  );
  socket.on(
    'remove_member',
    async (data: { conversation: any; memberId: string }) =>
      await removeMemberFromGroupChat(socket, user, data),
  );
  socket.on(
    'add_member',
    async (data: { conversation: any; memberIds: string[] }) =>
      await addMemberToGroupChat(socket, user, data),
  );

  socket.on(
    'update_conversation',
    async (conversation: any) => await updateConversation(socket, user, conversation),
  );

  socket.emit('welcome', { message: 'Welcome to the socket server!' });
};
