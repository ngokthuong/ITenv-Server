import { Socket } from 'socket.io';
import { IUser } from '../models/user';
import { IFriend } from '../models/friend';

export const acceptFriendSocket = async (socket: Socket, user: IUser, friend: any) => {
  socket.to(friend?.sendBy?._id?.toString()).emit('accept_friend', friend);
};
export const createFriendRequestSocket = async (socket: Socket, user: IUser, friend: any) => {
  socket.to(friend?.receiver?._id?.toString()).emit('receive_friend', friend);
};
