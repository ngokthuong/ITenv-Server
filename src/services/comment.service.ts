import mongoose from 'mongoose';
import Comment from '../models/comment';
import post from '../models/post';
import { updateVoteStatus } from './vote.service';
import comment from '../models/comment';
import { getInfoData } from '../utils/getInfoData.utils';

// GET CMT ( ALL )
const getChildrenComments = async (commentId: string) => {
  const children = await Comment.find({ parentComment: commentId })
    .populate('commentBy', 'username avatar _id')
    .sort({ isAccepted: -1, vote: -1, createdAt: -1 })
    .exec();
  // De quy lay cmt child
  for (const child of children) {
    child.children = await getChildrenComments(child._id.toString());
  }
  return children;
};

export const getCommentsByPostIdService = async (postId: string, page: number) => {
  const limit = 20;
  var skip = (page - 1) * limit;
  try {
    // Lấy bình luận gốc ( ko co parentcmt)
    const comments = await Comment.find({ postId, parentComment: null, isDeleted: false }) // Bình luận không có cha
      .populate('commentBy', 'username avatar _id')
      .sort({ isAccepted: -1, vote: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Lấy bình luận con
    for (const comment of comments) {
      comment.children = await getChildrenComments(comment._id.toString());
    }

    return comments;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// post && reply
export const postCommentService = async (
  parentComment: string,
  content: string,
  postId: string,
  commentBy: string,
) => {
  try {
    const findParentComment = await comment.findById(parentComment);
    // check null

    // if else
    if (!parentComment) {
      const createdParentComment = await Comment.create({
        postId,
        commentBy,
        content,
        parentComment: null,
      });
      return createdParentComment;
    } else if (!findParentComment?.parentComment && parentComment) {
      const createdChildComment = await Comment.create({
        postId,
        commentBy,
        content,
        parentComment,
      });
      return createdChildComment;
    } else {
      const createdChildComment = await Comment.create({
        commentBy,
        content,
        parentComment: findParentComment?.parentComment,
        postId,
      });

      return createdChildComment;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const voteCommentService = async (commentId: string, userId: string, typeVote: number) => {
  try {
    let findComment = await Comment.findById(commentId).populate(
      'commentBy',
      'username avatar _id',
    );
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!findComment) {
      throw new Error('Post not found');
    }
    findComment = updateVoteStatus(findComment, userObjectId, typeVote);

    if (findComment) await findComment.save();
    return findComment;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteCommentService = async (commentId: string): Promise<boolean> => {
  try {
    const deleteComment = await comment.findByIdAndUpdate(
      commentId,
      { isDeleted: true },
      { new: true },
    );

    return deleteComment !== null;
  } catch (error: any) {
    throw new Error('Failed to delete comment');
  }
};

export const editCommentByIdService = async (commentId: string, content: string) => {
  try {
    const currentComment = await comment.findOne({ _id: commentId, isDeleted: false });
    if (currentComment)
      return await comment
        .findByIdAndUpdate(commentId, { content: content }, { new: true })
        .populate('commentBy', 'username avatar _id');
    else return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resolveCommentInPostByUserIdService = async (_id: string) => {
  try {
    const result = await comment
      .findOneAndUpdate({ _id }, { resolve: true }, { new: true })
      .populate('commentBy', 'username avatar _id');

    if (result && result.postId) {
      const resolvePost = await post
        .findByIdAndUpdate(result.postId._id, { resolve: true }, { new: true })
        .populate('commentBy', 'username avatar _id');
      return {
        _id,
        postId: result?.postId,
        resolvePost: resolvePost?.resolve,
        ...getInfoData({ fileds: ['resolve'], object: result }),
      };
    }
    throw new Error('Reaolve comment in post fail!');
  } catch (error: any) {
    throw new Error(error.message);
  }
};
