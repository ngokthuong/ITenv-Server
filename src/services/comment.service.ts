import mongoose from 'mongoose';
import Comment from '../models/comment';
import post from '../models/post';
import { updateVoteStatus } from './vote.service';


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

export const getCommentsByPostIdService = async (postId: string) => {
  try {
    // Lấy bình luận gốc ( ko co parentcmt)
    const comments = await Comment.find({ postId, parentComment: null }) // Bình luận không có cha
      .populate('commentBy', 'username avatar _id')
      .sort({ isAccepted: -1, vote: -1, createdAt: -1 })
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

export const postCommentService = async (postId: string, userId: string, cmt: any) => {
  try {
    console.log(postId, userId, cmt);
    const createdComment = await Comment.create({
      postId,
      commentBy: userId,
      content: cmt.content,
      parentComment: cmt.parentComment || null,
    });
    // await post.findByIdAndUpdate(postId, { $push: { commentBy: createdComment._id } });
    return createdComment;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const voteCommentService = async (commentId: string, userId: string, typeVote: number) => {
  try {
    let findComment = await Comment
      .findById(commentId)
      .populate('commentBy', 'username avatar _id');
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
