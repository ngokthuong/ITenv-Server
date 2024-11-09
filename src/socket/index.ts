import mongoose from 'mongoose';
import { Socket } from 'socket.io';
import { IUser } from '../models/user';
import { NotificationRequestType } from '../types/NotificationType';
import { NotificationTypeEnum } from '../enums/notification.enum';
import notification from '../models/notification';
import post from '../models/post';
import comment from '../models/comment';
import { notifySocket } from './notification.socket';
import { messageSocket } from './message.socket';
export const socketFunctions = (socket: Socket, user: IUser) => {
  socket.on('notify', async (notificationReq) => await notifySocket(socket, user, notificationReq));
  socket.on('message', async(messageInfo)=> await messageSocket(socket, user, messageInfo))

  socket.emit('welcome', { message: 'Welcome to the socket server!' });
};
