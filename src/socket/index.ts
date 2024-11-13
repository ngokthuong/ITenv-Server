import { Socket } from 'socket.io';
import uploader, { cloudinaryConfig } from '../config/cloudinary';
import { IMessage } from '../models/message';
import { IUser } from '../models/user';
import { messageSocket, seenMessage } from './message.socket';
import { notifySocket } from './notification.socket';
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
  socket.emit('welcome', { message: 'Welcome to the socket server!' });
};
