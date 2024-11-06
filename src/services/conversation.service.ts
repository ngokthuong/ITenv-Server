import mongoose from "mongoose";
import Conversation from "../models/conversation";
import conversation from "../models/conversation";
import { QueryOption } from "../types/QueryOption.type";
import user from "../models/user";


export const getConversationsOfUserByUserIdService = async (userId: string, queryOption: QueryOption) => {
    try {
        const page = queryOption?.page || 1;
        const limit = queryOption?.pageSize || 20;
        const sortField = queryOption.sortField || "createdAt";
        const sortOrder = "ASC";
        const skip = (page - 1) * limit;

        const totalCount = await conversation.countDocuments({ participants: userId });

        const result = await conversation.find({ participants: userId })
            .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return { result, totalCount }; // Trả về kết quả và tổng số tài liệu
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export const checkListFriendService = async (listFriendId: string[]) => {
    const result = await user.find({ _id: { $in: listFriendId } });
    return result.length >= 2;
}

export const findConversationByIdService = async (conversationId: string) => {
    try {
        const result = await Conversation.findById(conversationId)
        return result;
    } catch (error: any) {
        throw new Error(error.message)
    }
}

// two people
export const createConversationForTwoPeopleByUserService = async (createBy: string, participantId: string[]) => {
    try {
        const data = {
            createBy,
            participants: participantId,
            isGroupChat: false,
        }
        const result = await Conversation.create(data);
        return result;
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const updateLastmessByConversationIdService = async (conversationId: string, lastMessageId: string) => {
    try {
        const result = await conversation.findByIdAndUpdate(conversationId, { lastMessage: lastMessageId }, { new: true })
        return result;
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const editConversationNameService = async (createBy: string, conversationId: string, groupName: string) => {
    try {
        const result = await conversation.findOneAndUpdate({ _id: conversationId, createBy }, { groupName }, { new: true });
        return result;
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const createGroupChatService = async (createBy: string, participants: string[], groupName: string) => {
    try {
        if (!(await checkListFriendService(participants))) {
            throw new Error("At least 3 people")
        }
        if (participants.includes(createBy)) {
            throw new Error("Validation failed, createBy existed")
        }
        const data = {
            createBy,
            participants: participants,
            isGroupChat: true,
            groupName
        }
        const result = await conversation.create(data);
        return result;
    } catch (error: any) {
        throw new Error(error.message)
    }

}