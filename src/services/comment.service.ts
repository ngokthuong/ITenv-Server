import mongoose from 'mongoose';
import comment from '../models/comment';
import post from '../models/post';
import { updateVoteStatus } from './vote.service';

export const getCommentByPostIdService = async (postId: string) => {
  try {
    const comments = await comment
      .find({ postId })
      .populate('commentBy', 'username avatar _id')
      .sort({ isAccepted: -1, vote: -1, createdAt: -1 })
      .exec();
    return comments;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
export const postCommentService = async (postId: string, userId: string, cmt: any) => {
  try {
    console.log(postId, userId, cmt);
    const createdComment = await comment.create({
      postId,
      commentBy: userId,
      content: cmt.content,
      parentComment: cmt.parentComment || null,
    });
    await post.findByIdAndUpdate(postId, { $push: { commentBy: createdComment._id } });
    return createdComment;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const voteCommentService = async (commentId: string, userId: string, typeVote: number) => {
  try {
    let findComment = await comment
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
