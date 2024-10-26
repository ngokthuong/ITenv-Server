// socket/authenticate.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { CustomJwtPayload } from '../middlewares/verifyToken.mdw';

export const authenticateSocket = async (socket: Socket) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    socket.disconnect(true);
    return null;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found.');
      socket.disconnect(true);
      return null;
    }
    // Update user status to online
    await user.updateOne({ status: 1 });
    return user;
  } catch (error) {
    console.error('JWT verification failed:', error);
    socket.disconnect(true);
    return null;
  }
};
