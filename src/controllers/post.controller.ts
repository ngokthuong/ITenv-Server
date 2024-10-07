import { Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import Post from '../models/post';

export const createPostController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user_id = req.user;
  const { title, content, isAnonymous = false } = req.body;
  //create new post
  if (!title || !content) {
    res.status(200).json({
      success: false,
      message: 'Title and content are required!',
    });
    return;
  }
  const newPost = await Post.create({ postBy: user_id, title, content, isAnonymous });
  if (newPost) res.status(200).json({ success: true, data: newPost });
  else res.status(404).json({ success: false, message: 'Error creating post' });
});

export const getAllPostsController = asyncHandler(async (req: Request, res: Response) => {
  const posts = await Post.find().populate({
    path: 'postBy',
    select: '_id username avatar',
  });
  // .populate({
  //   path: 'comment',
  //   populate: {
  //     path: 'commentBy',
  //     select: '_id username avatar',
  //   },
  // });

  res.status(200).json({ success: true, data: posts });
});
