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
  const disconnectTimeouts = new Map<string, NodeJS.Timeout>();
  io.on('connection', async (socket: Socket) => {
    const user = await authenticateSocket(socket);
    if (!user) {
      console.log('Authentication failed.');
      return;
    }

    const userId = user._id.toString();

    if (disconnectTimeouts.has(userId)) {
      clearTimeout(disconnectTimeouts.get(userId)!);
      disconnectTimeouts.delete(userId);
    }

    await updateUserStatus(user._id, socket);
    socket.join(userId);
    socketFunctions(socket, user);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      const offlineDate = new Date();
      const timeout = setTimeout(async () => {
        await User.findByIdAndUpdate(user._id, { status: 0, lastOnline: offlineDate }),
          disconnectTimeouts.delete(userId);
      }, 1000 * 60);
      disconnectTimeouts.set(userId, timeout);
    });
  });
};
