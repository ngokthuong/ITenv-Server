
import { EnumFriend } from "../enums/schemaFriend.enum";
import friend from "../models/friend"



export const createFriendRequest = async (data: any) => {
    try {
        return await friend.create(data);
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const acceptFriendRequestService = async (_id: string) => {
    try {
        return await friend.findByIdAndUpdate(_id, { status: EnumFriend.TYPE_ACCEPT, acceptedAt: new Date() }, { new: true })
    } catch (error: any) {
        throw new Error(error.message)
    }
}