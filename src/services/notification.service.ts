import notification from "../models/notification";


export const getNotificationByUserIdService = async (postedBy: string, page: number, pageSize: number) => {
    try {
        const limit = pageSize
        const skip = (page - 1) * limit;
        const result = await notification.find({ postedBy })
            .skip(skip)
            .limit(limit)
            .lean();
        return result;
    } catch (error: any) {
    }
};