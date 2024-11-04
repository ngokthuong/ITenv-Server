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
