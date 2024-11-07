import notification from '../models/notification';

export const getNotificationByUserIdService = async (
  userId: string,
  page: number,
  pageSize: number,
) => {
  try {
    const limit = pageSize;
    const skip = (page - 1) * limit;
    const sortField = "createdAt";
    const sortOrder = "ASC";
    const result = await notification
      .find({ receivers: { $in: [userId] } })
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit);
    const total = await notification.countDocuments({ receivers: { $in: [userId] } });
    return { result, total };
  } catch (error: any) {
    throw new Error(error.message)
  }
};

export const isSeenNotidicationService = async (notificationId: string) => {
  try {
    const result = await notification.findByIdAndUpdate(notificationId, { isSeen: true }, { new: true })
    return result;
  } catch (error: any) {
    throw new Error(error.message)
  }
}