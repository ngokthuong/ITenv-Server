import asyncHandler from 'express-async-handler';
import { getCommentByPostIdService, postCommentService } from '../services/comment.service';
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
