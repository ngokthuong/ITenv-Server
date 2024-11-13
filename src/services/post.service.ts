import { find } from 'lodash';
import post from '../models/post';
import { findUserById } from './user.service';
import { QueryOption } from '../types/QueryOption.type';
import mongoose from 'mongoose';
import { updateVoteStatus } from './vote.service';
import share from '../models/share';
import message from '../models/message';
import comment from '../models/comment';
// USER + ADMIN
export const createPostService = async (data: any) => {
  try {
    if (data.isAnonymous) {
      const newPost = await post.create(data);
      const result = await post.findById(newPost._id).select('-postedBy');
      return result;
    }
    const currentUser = await findUserById(data.postedBy);
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
    const tagsRequest = queryOption.tags || [];
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

    const posts = await post
      .find(querySearch)
      .sort({ [sortField]: sortOrder === 'ASC' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const populatedPosts = await Promise.all(
      posts.map(async (postItem) => {
        const totalComment = await comment.countDocuments({ postId: postItem._id });
        if (!postItem.isAnonymous) {
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
          (populatedUser as any).totalComment = totalComment;
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
          (populatedTags as any).totalComment = totalComment;
          return populatedTags;
        }
      }),
    );
    const totalPosts = await post.countDocuments({ categoryId });
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
    console.log(editPost);
    if (data.isAnonymous) {
      return editPost;
    }
    const currentUser = await findUserById(data.postedBy);
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

export const deletePostServise = async (postId: string, postedBy: string) => {
  try {
    return await post.findOneAndUpdate(
      { _id: postId, postedBy: postedBy },
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
      .find({ postedBy })
      .sort({ [sortField]: sortOrder === 'DESC' ? 1 : -1 })
      .populate('tags', 'name description type')
      .skip(skip)
      .limit(limit)
      .lean();
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
