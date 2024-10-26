
import friend from "../models/friend"




export const createFriendRequest = async (data: any) => {
    try {
        return await friend.create(data);
    } catch (error: any) {
        throw new Error(error.message)
    }
}