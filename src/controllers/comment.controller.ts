import asyncHandler from 'express-async-handler';
import {
  getCommentByPostIdService,
  postCommentService,
  voteCommentService,
} from '../services/comment.service';
import { AuthRequest } from '../types/AuthRequest.type';

export const getCommentByPostIdController = asyncHandler(async (req: any, res: any) => {
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 10);
  var skip = (page - 1) * limit;
  const { postId } = req.params;
  try {
    const comments = await getCommentByPostIdService(postId);
    return res.status(200).json({
      success: true,
      data: comments,
      total: comments.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const postCommentController = asyncHandler(async (req: AuthRequest, res: any) => {
  const { postId } = req.params;
  const postedBy = req.user?.userId;
  const comment = req.body;

  if (!postedBy) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }
  try {
    const newComment = await postCommentService(postId, postedBy, comment);
    console.log(newComment);
    return res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const voteCommentController = asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user?.userId;
  const commentId = req.params._id;
  const { typeVote } = req.body;
  console.log(req.body);
  try {
    if (userId) {
      const result = await voteCommentService(commentId, userId, typeVote);
      if (result) return res.status(200).json({ success: true, message: 'success' });
      return res.status(200).json({ success: false, message: 'failed' });
    }
  } catch (error) {
    return res.status(200).json({ success: false, message: 'failed' });
  }
});
