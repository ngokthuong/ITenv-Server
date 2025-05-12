import notification from '../models/notification';

export const getNotificationByUserIdService = async (
  userId: string,
  page: number,
  pageSize: number,
) => {
  try {
    const limit = pageSize;
    const skip = (page - 1) * limit;
    const sortField = 'createdAt';
    // const sortOrder = 'ASC';
    //  const query = {
    //    $or: [{ receivers: { $in: [userId] } }, { isGlobal: true }],
    //    isDeleted: false,
    //  };
    const query = {
      $or: [{ receivers: { $in: [userId] } }],
      isDeleted: false,
    };
    const result = await notification
      .find(query)
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit)
      .populate('postedBy', '_id username avatar')
      .lean();
    const total = await notification.countDocuments(query);
    return { result, total };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const isSeenNotidicationService = async (notificationId: string) => {
  try {
    const result = await notification.findByIdAndUpdate(
      notificationId,
      { isSeen: true },
      { new: true },
    );
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
