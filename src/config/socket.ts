import { Socket } from 'socket.io';
import { Server as SocketServer } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { CustomJwtPayload } from '../middlewares/verifyToken.mdw';
import User from '../models/user';
import { authenticateSocket } from '../socket/authen.socket';
import mongoose from 'mongoose';
import { socketFunctions } from '../socket';
const updateUserStatus = async (userId: mongoose.Types.ObjectId, socket: Socket) => {
  try {
    await User.findByIdAndUpdate(userId, { status: 1 });
    console.log(`User connected: ${userId}`);
  } catch (err) {
    console.error('Error updating socket ID:', err);
    socket.disconnect(true);
  }
};

export const setupSocket = (server: any) => {
  const socketOptions = {
    cors: {
      origin: process.env.CLIENT_URL, // Your React app's URL
      methods: ['GET', 'POST'],
    },
  };

  const io = new SocketServer(server, socketOptions);

  io.on('connection', async (socket: Socket) => {
    const user = await authenticateSocket(socket);
    if (!user) {
      console.log('Authentication failed.');
      return;
    }
    await updateUserStatus(user._id, socket);

    socketFunctions(socket, user);

    

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${user._id}`);
      await User.findByIdAndUpdate(user._id, { status: 0, lastOnline: new Date() });
    });
  });
};
