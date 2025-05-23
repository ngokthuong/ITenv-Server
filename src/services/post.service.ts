import post from '../models/post';
import { findUserByIdService } from './user.service';
import { QueryOption } from '../types/QueryOption.type';
import mongoose from 'mongoose';
import { updateVoteStatus } from './vote.service';
import share from '../models/share';
import comment from '../models/comment';
import { Constants } from '../enums/constants.enum';
// USER + ADMIN
export const createPostService = async (data: any) => {
  try {
    if (data.isAnonymous) {
      const newPost = await post.create(data);
      const result = await post.findById(newPost._id).select('-postedBy');
      return result;
    }
    const currentUser = await findUserByIdService(data.postedBy);
    if (currentUser) {
      const newPost = (await post.create(data)).populate('postedBy', 'username avatar status');
      return newPost;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// have pagination
// ALL
export const getPostsWithCategoryIdAndTagsService = async (
  categoryId: string,
  queryOption: QueryOption,
) => {
  try {
    const page = queryOption?.page || 1;
    const limit = queryOption?.pageSize || 20;
    const sortField = queryOption.sortField || 'createdAt';
    const sortOrder = queryOption.sortOrder || 'DESC';
    const skip = (page - 1) * limit;
    const tagsRequest = Array.isArray(queryOption.tags)
      ? queryOption.tags
      : queryOption.tags
        ? [queryOption.tags]
        : [];
    const searchRequest = queryOption.search || '';
    // create 1 condition
    const conditions = [];
    // if searchRequest exist then push in condition
    if (searchRequest) {
      conditions.push({
        $or: [
          { title: { $regex: searchRequest, $options: 'i' } },
          { content: { $regex: searchRequest, $options: 'i' } },
        ],
      });
    }
    // if tagsRequest exist then push in condition
    if (tagsRequest.length > 0) {
      conditions.push({
        tags: { $all: tagsRequest },
      });
    }
    // create querySearch use to in function find()
    let querySearch = {};
    if (conditions.length > 0) {
      querySearch = {
        // use and to query two value search and tags
        $and: conditions,
      };
    } else {
      querySearch = {};
    }

    // const posts = await post
    //   .find({ ...querySearch, categoryId, isDeleted: false })
    //   .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
    //   .skip(skip)
    //   .limit(limit)
    //   .lean();
    const posts = await findPostWithViewsOrVotesService(
      querySearch,
      categoryId,
      sortField,
      sortOrder,
      skip,
      limit,
    );

    const populatedPosts = await Promise.all(
      posts.map(async (postItem) => {
        const totalComment = await comment.countDocuments({
          postId: postItem._id,
          isDeleted: false,
        });
        if (!postItem.isAnonymous) {
          const populatedUser = await post.populate(postItem, [
            {
              path: 'postedBy',
              select: 'username email id avatar',
            },
            {
              path: 'tags',
              select: 'name description type',
            },
          ]);
          (populatedUser as any).totalComment = totalComment;
          return populatedUser;
        } else {
          if (postItem.postedBy) {
            delete postItem.postedBy;
          }
          const populatedTags = await post.populate(postItem, {
            path: 'tags',
            select: 'name description type',
          });
          (populatedTags as any).totalComment = totalComment;
          return populatedTags;
        }
      }),
    );
    const totalPosts = await post.countDocuments({ categoryId, isDeleted: false, ...querySearch });
    return {
      posts: populatedPosts,
      totalPosts,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// USER
export const getPostByIdService = async (postId: string) => {
  try {
    const postItem = await post.findById(postId);
    if (!postItem?.isAnonymous) {
      const populatedUser = await post.populate(postItem, [
        {
          path: 'postedBy',
          select: 'username email id avatar',
        },
        {
          path: 'tags',
          model: 'Tag',
          select: 'name description type',
        },
      ]);
      return populatedUser;
    } else {
      if (postItem.postedBy) {
        delete postItem.postedBy;
      }
      const populatedTags = await post.populate(postItem, {
        path: 'tags',
        model: 'Tag',
        select: 'name description type',
      });
      return populatedTags;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// USER
export const getAllTagsInPostsWithCateService = async (categoryID: string) => {
  try {
    // get all tags in posts with categoryID
    const tags = await post.aggregate([
      // filter with cateID
      { $match: { categoryID } },
      { $match: { tag: { $ne: null } } },
      // get each tag in array
      { $unwind: '$tags' },
      // gross all tags and remove duplicate
      { $group: { _id: null, tags: { $addToSet: '$tags' } } },
      // get only tags
      { $project: { _id: 0, tags: 1 } },
    ]);
    return tags;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// edit
export const editPostByIdService = async (_id: string, data: any) => {
  try {
    const editPost = await post.findByIdAndUpdate(_id, data, { new: true });
    if (data.isAnonymous) {
      return editPost;
    }
    const currentUser = await findUserByIdService(data.postedBy);
    if (currentUser) {
      return {
        postedBy: editPost?.postedBy,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        userStatus: currentUser.status,
        title: editPost?.title,
        content: editPost?.content,
        isAnonymous: editPost?.isAnonymous,
        // isDeleted: editPost?.isDeleted,
        tags: editPost?.tags,
        categoryId: editPost?.categoryId,
      };
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const votePostService = async (postId: string, userId: string, typeVote: number) => {
  try {
    let findPost = await post.findById(postId);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!findPost) {
      throw new Error('Post not found');
    }
    findPost = updateVoteStatus(findPost, userObjectId, typeVote);

    if (findPost) await findPost.save();
    return findPost;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const searchPostsWithCategoryService = async (
  categoryId: string,
  queryOption: QueryOption,
) => {
  try {
    const page = queryOption?.page || 1;
    const limit = queryOption?.pageSize || 20;
    const sortField = queryOption.sortField || 'createdAt';
    const sortOrder = queryOption.sortOrder || 'DESC';
    const skip = (page - 1) * limit;

    const querySearch = {
      $and: [
        categoryId ? { categoryId } : {},
        queryOption.search
          ? {
              $or: [
                { title: { $regex: queryOption.search, $options: 'i' } },
                {
                  $and: [
                    { content: { $regex: queryOption.search, $options: 'i' } },
                    { title: { $exists: false } },
                  ],
                },
              ],
            }
          : {},
      ],
    };

    const posts = await post
      .find(querySearch)
      .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    return posts;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const findPostWithViewsOrVotesService = async (
  querySearch: any,
  categoryId: string,
  sortField: string,
  sortOrder: string,
  skip: number,
  limit: number,
) => {
  try {
    const ObjectId = mongoose.Types.ObjectId;
    const matchStage: any = {
      ...querySearch,
      categoryId: new ObjectId(categoryId),
      isDeleted: false,
    };

    const addFieldsStage: any = {};
    const sortStage: any = {};

    if (sortField === Constants.VOTES) {
      addFieldsStage.voteBalance = {
        $subtract: [{ $size: '$vote' }, { $size: '$downVote' }],
      };
      sortStage.voteBalance = sortOrder === 'ASC' ? 1 : -1;
    } else if (sortField === Constants.VIEWS) {
      addFieldsStage.viewCount = { $size: '$view' };
      sortStage.viewCount = sortOrder === 'ASC' ? 1 : -1;
    } else {
      sortStage.createdAt = sortOrder === 'ASC' ? 1 : -1;
    }
    const pipeline = [
      { $match: matchStage },
      { $addFields: addFieldsStage },
      { $sort: sortStage },
      { $skip: +skip },
      { $limit: +limit },
      // { $project: { voteCount: 0, viewCount: 0 } },
    ];

    const posts = await post.aggregate(pipeline);
    return posts;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deletePostServise = async (postId: string) => {
  try {
    return await post.findOneAndUpdate(
      { _id: postId },
      { isDeleted: true },
      { new: true, runValidators: true },
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

interface SharePostData {
  sharedBy: string;
  postId: string;
  shareToProfile?: boolean;
}

export const sharePostToProfileService = async (data: SharePostData) => {
  try {
    data.shareToProfile = true;
    return await share.create(data);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getPostsByUserIdService = async (postedBy: string, queryOption: QueryOption) => {
  try {
    const page = queryOption?.page || 1;
    const limit = queryOption?.pageSize || 20;
    const sortField = queryOption.sortField || 'createdAt';
    const sortOrder = queryOption.sortOrder || 'ASC';
    const skip = (page - 1) * limit;

    const result = await post
      .find({ postedBy, isDeleted: false })
      .sort({ [sortField]: sortOrder === 'DESC' ? 1 : -1 })
      .populate('tags', 'name description type')
      .populate('postedBy', 'username avatar _id')
      .skip(skip)
      .limit(limit)
      .lean();
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getPostsWithYearService = async (queryOption: QueryOption, userId: string) => {
  try {
    const year = queryOption.year || new Date().getFullYear();
    const page = queryOption.page || 1;
    const pageSize = queryOption.pageSize || 20;
    const sortField = queryOption.sortField || 'createAt';
    const sortOrder = queryOption.sortOrder || 'ASC';

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Query documents created within this date range
    const result = await post
      .find({
        postedBy: userId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        isDeleted: false,
      })
      .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const total = await post.countDocuments({
      postedBy: userId,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      isDeleted: false,
    });
    return { total, result };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resolvePostByUserIdService = async (_id: string, postedBy: string) => {
  try {
    const result = await post.findOneAndUpdate(
      { _id: _id, postedBy: postedBy },
      { resolve: true },
      { new: true },
    );
    return !!result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const postActivityDistributionService = async (queryOption: QueryOption) => {
  try {
    const month = queryOption.month || new Date().getMonth() + 1;
    const year = queryOption.year || new Date().getFullYear();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const posts = await post.find({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
      isDeleted: false,
    });

    const result = processPostData(posts);

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const processPostData = async (posts: any[]) => {
  try {
    let totalPosts = posts.length;
    let totalComments = 0;
    let totalUpvotes = 0;
    let totalDownvotes = 0;
    let totalShares = 0;

    for (const post of posts) {
      const totalCommentsInPost = await comment.countDocuments({
        postId: post._id,
        isDeleted: false,
      });
      totalComments += totalCommentsInPost;
      totalUpvotes += parseInt(post.vote.length.toString());
      totalDownvotes += parseInt(post.downVote.length.toString());
      const totalSharesPost = await share.countDocuments({ postId: post._id, isDeleted: false });
      totalShares += totalSharesPost;
    }

    return {
      totalPosts,
      totalComments,
      totalUpvotes,
      totalDownvotes,
      totalShares,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ---------------------------------------------------ADMIN-----------------------------------------------------------------------

export const getTotalActivePostsService = async () => {
  try {
    const total = await post.countDocuments({ isDeleted: false });
    return total;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getTotalPostsService = async () => {
  try {
    const total = await post.countDocuments({});
    return total;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getPostsDataDistributionByYearService = async (queryOption: QueryOption) => {
  try {
    const year = queryOption.year || new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, index) => index + 1);
    let results: any[] = [];

    for (const month of months) {
      const startOfMonth = new Date(year, month - 1, 1); // Ngày đầu tháng
      const endOfMonth = new Date(year, month, 0); // Ngày cuối tháng
      const total = await getPostsDataDistributionByMonth(startOfMonth, endOfMonth);
      results.push({ month, total });
    }

    return results;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getPostsDataDistributionByMonth = async (startOfMonth: Date, endOfMonth: Date) => {
  try {
    const total = await post.countDocuments({
      isDeleted: false,
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    return total;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllTotalDataInPostPageService = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const totalPost = await getTotalPostsService();
    const totalNewPostsToday = await getNewPostTodayService(startOfDay, endOfDay);
    const postBlocked = await getPostsBlockedService();
    const postActive = await getTotalActivePostsService();
    const data = {
      totalPost,
      totalNewPostsToday,
      postBlocked,
      postActive,
    };
    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getPostsBlockedService = async () => {
  try {
    const result = await post.countDocuments({ isDeleted: true });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getNewPostTodayService = async (startOfDay: Date, endOfDay: Date) => {
  try {
    const result = await post.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getDataDailyPostsTrendService = async () => {
  try {
    const today = new Date();
    const sevenDaysArray: any[] = [];
    const result: any[] = [];
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    for (let i = 1; i <= 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      sevenDaysArray.push(day);
    }

    for (let i = 0; i < sevenDaysArray.length; i++) {
      const currentDay = new Date(sevenDaysArray[i]);
      const startOfDay = new Date(currentDay);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDay);
      endOfDay.setHours(23, 59, 59, 999);
      const posts = await getNewPostTodayService(startOfDay, endOfDay);
      const dayIndex = startOfDay.getDay();
      result.push({ DayOfWeek: daysOfWeek[dayIndex], total: posts });
    }
    return result.reverse();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getDatePostsOverviewService = async () => {
  try {
    const year = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, index) => index + 1);
    let results: any[] = [];

    for (const month of months) {
      const startOfMonth = new Date(year, month - 1, 1); // Ngày đầu tháng
      const endOfMonth = new Date(year, month, 0); // Ngày cuối tháng
      const total = await getPostsDataDistributionByMonth(startOfMonth, endOfMonth);
      results.push({ month, total });
    }

    return results;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllPostsService = async (queryOption: QueryOption) => {
  try {
    const page = queryOption.page || 1;
    const pageSize = queryOption.pageSize || 10;
    const search = queryOption.search || '';
    const sortField = queryOption.sortField || 'createdAt';
    const sortOrder = queryOption.sortOrder || 'DESC';
    const searchCondition = search ? { title: { $regex: search, $options: 'i' } } : {};

    const result = await post
      .find(searchCondition)
      .sort({ [sortField]: sortOrder === 'DESC' ? 1 : -1 })
      .populate([
        {
          path: 'postedBy',
          select: 'username email id avatar',
        },
        {
          path: 'tags',
          model: 'Tag',
          select: 'name description type',
        },
        {
          path: 'categoryId',
          select: 'name _id',
        },
      ])
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const total = await post.countDocuments(searchCondition);

    return { total, result };
  } catch (error: any) {
    console.error('Error fetching posts:', error);

    throw new Error(`Failed to fetch posts: ${error.message || 'Unknown error'}`);
  }
};
