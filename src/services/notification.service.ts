import notification from '../models/notification';

export const getNotificationByUserIdService = async (
  userId: string,
  page: number,
  pageSize: number,
) => {
  try {
    const limit = pageSize;
    const skip = (page - 1) * limit;
    const result = await notification
      .find({ receivers: { $in: [userId] } })
      .skip(skip)
      .limit(limit);
    const total = await notification.countDocuments({ receivers: { $in: [userId] } });
    return { result, total };
  } catch (error: any) {
    return { result: [], total: 0 };
  }
};

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