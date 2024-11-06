import notification from "../models/notification";


export const getNotificationByUserIdService = async (postedBy: string, page: number, pageSize: number) => {
    try {
        const limit = pageSize
        const skip = (page - 1) * limit;
        const sortField = "createdAt";
        const sortOrder = "ASC";
        const result = await notification.find({ postedBy })
            .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const totalNoti = await notification.countDocuments({ postedBy });

        return { result, totalNoti };
    } catch (error: any) {
    }
};