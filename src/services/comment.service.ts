import comment from '../models/comment';
import post from '../models/post';

export const getCommentByPostIdService = async (postId: string) => {
  try {
    const comments = await comment
      .find({ postId })
      .populate('commentBy', 'username avatar _id')
      .populate('vote')
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
