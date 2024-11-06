import uploadCloud from "../config/cloudinary";
import message from "../models/message";
import { QueryOption } from "../types/QueryOption.type";
import { checkListFriendService, createConversationForTwoPeopleByUserService, findConversationByIdService, updateLastmessByConversationIdService } from "./conversation.service";

export const postMessageToConversationService = async (data: any) => {
    try {
        return await message.create(data);
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const getAllMesssOfCvssByCvssIdService = async (conversationId: string, queryOption: QueryOption) => {
    try {
        const page = queryOption?.page || 1;
        const limit = queryOption?.pageSize || 20;
        const sortField = queryOption.sortField || "createdAt";
        const sortOrder = queryOption.sortOrder || "ASC"
        const skip = (page - 1) * limit;

        const result = await message.find({ conversationId, isRecalled: false })
            .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean()
        // const totalMessages = await message.countDocuments({ conversationId });
        return result
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const addMessForConvertationByUserIdService = async (data: any, sender: string, fileUrl?: string) => {
    try {
        let { reciever, content, conversationId, hasFile, hasText, parentMessage } = data;
        const recieverArray = Array.isArray(reciever) ? reciever : [reciever];
        recieverArray.push(sender);
        // have conversation
        if (!(await findConversationByIdService(conversationId))) {
            // create conversation
            const result = await createConversationForTwoPeopleByUserService(sender, recieverArray);
            conversationId = result._id.toString();
        }
        // add mess
        return await postMessageToConversationService({ sender, conversationId, hasFile, hasText, fileUrl, content, parentMessage });
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const recalledMessageBySenderService = async (sender: string, messId: string) => {
    try {
        return await message.findOneAndUpdate({ sender, _id: messId }, { isRecalled: true }, { new: true })
    } catch (error: any) {
        throw new Error(error.message)
    }
}