import { Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import Post from '../models/post';
import { createPostService, editPostByIdService, getPostByIdService, getPostsWithCategoryIdService } from '../services/post.service'
import { validateCreatePost } from '../helper/joiSchemaRegister.helper';
import { ResponseType } from '../types/Response.type'

// create
export const createPostController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const postedBy = req.user?.userId;
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
    if (postedBy) {
      const newPost = await createPostService({ postedBy, title, content, isAnonymous, tags, categoryId });
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

// read
export const getPostsWithCategoryIdController = asyncHandler(async (req: any, res: any) => {
  try {
    const queryOption = req.body.queryOption;
    const { posts, totalPosts } = await getPostsWithCategoryIdService(req.params.categoryId, queryOption);
    const response: ResponseType<typeof posts> = {
      success: true,
      data: posts,
      total: totalPosts,
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

export const getPostByIdController = asyncHandler(async (req: any, res: any) => {
  try {

    const data = await getPostByIdService(req.params._id);

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

// update 
export const editPostByIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const postedBy = req.user?.userId;
    const { _id, title, content, isAnonymous, tags, categoryId } = req.body;
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
    if (postedBy) {
      const editPost = await editPostByIdService(_id, { postedBy, title, content, isAnonymous, tags, categoryId });
      const response: ResponseType<typeof editPost> = {
        success: true,
        data: editPost,
        timeStamp: new Date()
      };
      return res.status(200).json(response);
    }
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
