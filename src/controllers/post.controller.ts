import { Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import Post from '../models/post';
import { createPostService } from '../services/post.service'
import { validateCreatePost } from '../helper/joiSchemaRegister.helper';
import { ResponseType } from '../types/Response.type'

// export const createPostController = asyncHandler(async (req: AuthRequest, res: Response) => {
//   const user_id = req.user?.userId;
//   const { title, content, isAnonymous, tags, categoryId } = req.body;


//   if (!title || !content) {
//     res.status(200).json({
//       success: false,
//       message: 'Title and content are required!',
//     });
//     return;
//   }
//   const newPost = await Post.create({ postBy: user_id, title, content, isAnonymous });
//   if (newPost) res.status(200).json({ success: true, data: newPost });
//   else res.status(404).json({ success: false, message: 'Error creating post' });
// });

export const createPostController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const postBy = req.user?.userId;
    const { title, content, isAnonymous, tags, categoryId } = req.body;
    const { error } = validateCreatePost.validate({ title, content, categoryId }, { allowUnknown: true });
    if (error) {
      const response: ResponseType<null> = {
        success: false,
        data: null,
        error: error.message,
        timeStamp: new Date()
      };
      return res.status(500).json(response);
    }
    if (postBy) {
      const newPost = await createPostService({ postBy, title, content, isAnonymous, tags, categoryId });
      console.log(newPost)
      const response: ResponseType<typeof newPost> = {
        success: true,
        data: newPost,
        timeStamp: new Date()
      };
      return res.status(200).json(response);
    }
  }
  catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,
      timeStamp: new Date()
    };
    return res.status(500).json(response);
  }
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
