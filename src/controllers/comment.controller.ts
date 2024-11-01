import asyncHandler from 'express-async-handler';
import {
  deleteCommentService,
  editCommentByIdService,
  getCommentsByPostIdService,
  postCommentService,
  voteCommentService,
} from '../services/comment.service';
import { AuthRequest } from '../types/AuthRequest.type';
import { ResponseType } from '../types/Response.type';

export const getCommentsByPostIdController = asyncHandler(async (req: any, res: any) => {
  const page = parseInt(req.query.page || 1);
  const { postId } = req.params;
  try {
    const comments = await getCommentsByPostIdService(postId, page);
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
  // don't full 
  const comment = req.body;

  if (!postedBy) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }
  try {
    const newComment = await postCommentService(comment.parentComment, comment.content, postId, postedBy);
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
  try {
    if (userId) {
      const result = await voteCommentService(commentId, userId, typeVote);
      if (result) return res.status(200).json({ success: true, message: 'success', data: result });
      return res.status(200).json({ success: false, message: 'failed' });
    }
  } catch (error) {
    return res.status(200).json({ success: false, message: 'failed' });
  }
});

export const deleteCommentController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const commentId = req.params._id;
    const result = await deleteCommentService(commentId);
    if (result) {
      const response: ResponseType<null> = {
        success: true,
        message: 'Comment is deleted',
      };
      return res.status(200).json(response);
    }
    const response: ResponseType<null> = {
      success: false,
      message: 'Comment is not deleted',
    };
    return res.status(404).json(response);

  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      message: error.message,
    };
    return res.status(500).json(response);
  }
});

export const editCommentByIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const commentId = req.params._id;
    const { content } = req.body;
    const result = await editCommentByIdService(commentId, content);
    if (result != null) {
      const response: ResponseType<typeof result> = {
        success: true,
        data: result,
        message: 'Comment is edited',
      };
      return res.status(200).json(response);
    }
    const response: ResponseType<null> = {
      success: false,
      message: 'Failed to edit comment',
    };
    return res.status(500).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      message: 'Failed to edit comment',
    };
    return res.status(500).json(response);
  }

});