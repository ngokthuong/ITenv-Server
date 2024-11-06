import { Response, Request } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import Post from '../models/post';
import {
  createPostService,
  deletePostServise,
  editPostByIdService,
  getPostByIdService,
  getPostsByUserIdService,
  getPostsWithCategoryIdAndTagsService,
  searchPostsWithCategoryService,
  sharePostToProfileService,
  votePostService,
} from '../services/post.service';
import { validateCreatePost } from '../helper/joiSchemaRegister.helper';
import { ResponseType } from '../types/Response.type';

// create
// mac dinh khi create Post thi status la false
export const createPostController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const postedBy = req.user?.userId;
    const { title, content, isAnonymous, tags, categoryId } = req.body;
    const { error } = validateCreatePost.validate(
      { title, content, categoryId },
      { allowUnknown: true },
    );
    if (error) {
      const response: ResponseType<null> = {
        success: false,
        data: null,
        error: error.message,

      };
      return res.status(500).json(response);
    }
    if (postedBy) {
      const newPost = await createPostService({
        postedBy,
        title,
        content,
        isAnonymous,
        tags,
        categoryId,
      });
      const response: ResponseType<typeof newPost> = {
        success: true,
        data: newPost,

      };
      return res.status(200).json(response);
    }
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,

    };
    return res.status(500).json(response);
  }
});

// read
export const getPostsWithCategoryIdAndTagsController = asyncHandler(async (req: any, res: any) => {
  try {
    const queryOption = req.query;
    const { posts, totalPosts } = await getPostsWithCategoryIdAndTagsService(
      req.params.categoryId,
      queryOption,
    );
    const response: ResponseType<typeof posts> = {
      success: true,
      data: posts,
      total: totalPosts,
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,
    };
    return res.status(500).json(response);
  }
});

export const getPostByIdController = asyncHandler(async (req: any, res: any) => {
  try {
    const data = await getPostByIdService(req.params._id);
    const response: ResponseType<typeof data> = {
      success: true,
      data: data,

    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,

    };
    return res.status(500).json(response);
  }
});

export const votePostController = asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user?.userId;
  const postId = req.params._id;
  const { typeVote } = req.body;
  try {
    if (userId) {
      const result = await votePostService(postId, userId, typeVote);
      if (result) return res.status(200).json({ success: true, message: 'success' });
      return res.status(200).json({ success: false, message: 'failed' });
    }
  } catch (error) {
    return res.status(200).json({ success: false, message: 'failed' });
  }
});

// update
export const editPostByIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const postedBy = req.user?.userId;
    const { _id, title, content, isAnonymous, tags, categoryId } = req.body;
    const { error } = validateCreatePost.validate(
      { title, content, categoryId },
      { allowUnknown: true },
    );
    if (error) {
      const response: ResponseType<null> = {
        success: false,
        data: null,
        error: error.message,

      };
      return res.status(500).json(response);
    }
    if (postedBy) {
      const editPost = await editPostByIdService(_id, {
        postedBy,
        title,
        content,
        isAnonymous,
        tags,
        categoryId,
      });
      const response: ResponseType<typeof editPost> = {
        success: true,
        data: editPost,

      };
      return res.status(200).json(response);
    }
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,

    };
    return res.status(500).json(response);
  }
});

// 
// export const updateViewPost = asyncHandler(async (req: ))

export const deletePostByIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const postedBy = req.user?.userId;
    const postId = req.params.postId;
    if (postedBy && postId) {
      const deletePost = await deletePostServise(postId, postedBy);
      const response: ResponseType<typeof deletePost> = {
        success: true,
        data: deletePost,
      };
      return res.status(200).json(response);
    }
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,

    };
    return res.status(500).json(response);
  }
});

// All
// Search post 
export const searchPostWithCategoryIdController = asyncHandler(async (req: any, res: any) => {
  try {
    const queryOption = req.query;
    const searchPosts = await searchPostsWithCategoryService(
      req.params.categoryId,
      queryOption,
    );
    const response: ResponseType<typeof searchPosts> = {
      success: true,
      data: searchPosts,
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,
    };
    return res.status(500).json(response);
  }
});

// Share post 
export const sharePostToProfileController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const sharedBy = req.user?.userId;
    const postId = req.params.postId;
    if (sharedBy && postId) {
      const sharePost = await sharePostToProfileService({ sharedBy, postId });
      const response: ResponseType<typeof sharePost> = {
        success: true,
        data: sharePost,
      };
      return res.status(200).json(response);
    }
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: "Share post is not successfully",
    };
    return res.status(500).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,
    };
    return res.status(500).json(response);
  }
});

export const getPostsByUserIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const postedBy = req.params.postedBy;
    const result = await getPostsByUserIdService(postedBy as string);
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseType<null> = {
      success: false,
      data: null,
      error: error.message,
    };
    return res.status(400).json(response);
  }
})
