import { Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import Post from '../models/post';
import { createPostService, getPostsWithCategoryIdService } from '../services/post.service'
import { validateCreatePost } from '../helper/joiSchemaRegister.helper';
import { ResponseType } from '../types/Response.type'

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

export const getPostsWithCategoryIdController = asyncHandler(async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await getPostsWithCategoryIdService(req.body.categoryId, page);
    const response: ResponseType<typeof data> = {
      success: true,
      data: data,
      timeStamp: new Date()
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,
      timeStamp: new Date()
    };
    return res.status(500).json(response);
  }
})
