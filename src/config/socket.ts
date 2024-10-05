import { Socket } from 'socket.io';
import { Server as SocketServer } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { CustomJwtPayload } from '../middleware/verifyToken.mdw';
import User from '../models/user';

export const setupSocket = (server: any) => {
  const socketOptions = {
    cors: {
      origin: process.env.CLIENT_URL, // Your React app's URL
      methods: ['GET', 'POST'],
    },
  };

  const io = new SocketServer(server, socketOptions);

  io.on('connection', async (socket: Socket) => {
    const token = socket.handshake.auth.token;
    let user: any = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;
      user = await User.findById(decoded.user);
      if (!user) {
        console.log('User not found.');
        return socket.disconnect(true);
      }
    } catch (err) {
      console.error('JWT verification failed:', err);
      return socket.disconnect(true);
    }

    try {
      await User.findByIdAndUpdate(user._id, { status: 1 });
      console.log(`User connected: ${user._id}`);
    } catch (err) {
      console.error('Error updating socket ID:', err);
      socket.disconnect(true);
    }
    


   
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${user._id}`);
      await User.findByIdAndUpdate(user._id, { status: 0, lastOnline: new Date() });
    });
  });
};
