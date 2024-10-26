import mongoose from 'mongoose';
import { Socket } from 'socket.io';
import { IUser } from '../models/user';
export const socketFunctions = (socket: Socket, user: IUser) => {
  socket.on('notify', (data) => {
    console.log(`Received event 'someEvent' from user ${user._id}`, data);
  });

  socket.emit('welcome', { message: 'Welcome to the socket server!' });
};
