
import { EnumFriend } from "../enums/schemaFriend.enum";
import friend from "../models/friend"



export const createFriendRequest = async (data: any) => {
    try {
        return await friend.create(data);
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const acceptFriendRequestService = async (_id: string, userId: string) => {
    try {
        return await friend.findOneAndUpdate(
            {
                _id: _id,
                $or: [{ sendBy: userId }, { receiver: userId }]
            },
            {
                status: EnumFriend.TYPE_ACCEPT,
                acceptedAt: new Date()
            },
            { new: true }
        );
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const rejectFriendRequestService = async (_id: string, userId: string) => {
    try {
        return await friend.findOneAndDelete(
            {
                _id: _id,
                $or: [{ sendBy: userId }, { receiver: userId }]
            })
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const blockFriendRequestService = async (_id: string, blockBy: string) => {
    try {
        return await friend.findOneAndUpdate({
            _id: _id,
            $or: [{ sendBy: blockBy }, { receiver: blockBy }]
        }, { isBlockBy: blockBy, status: EnumFriend.TYPE_BLOCKED }, { new: true })
    } catch (error: any) {
        throw new Error(error.message)
    }
}