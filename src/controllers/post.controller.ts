import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../types/AuthRequest.type';
import Post from '../models/post';
import {
  createPostService,
  deletePostServise,
  editPostByIdService,
  getAllTotalDataInPostPageService,
  getDataDailyPostsTrendService,
  getDatePostsOverviewService,
  getAllPostsService,
  getPostByIdService,
  getPostsByUserIdService,
  getPostsDataDistributionByYearService,
  getPostsWithCategoryIdAndTagsService,
  getPostsWithYearService,
  getTotalActivePostsService,
  getTotalPostsService,
  postActivityDistributionService,
  resolvePostByUserIdService,
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
      return res.status(201).json(response);
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
      return res.status(400).json({ success: false, message: 'failed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'failed' + error });
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
    const postedBy = req?.user?.userId;
    const postId = req.params.postId;
    if (postedBy && postId) {
      const deletePost = await deletePostServise(postId);
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

export const getPostActivitiesController = asyncHandler(async (req: any, res: any) => {
  const { userId } = req.params;
  const { year } = req.query || 2024;

  try {
    if (!year || isNaN(year)) {
      return res.status(400).json({ message: 'Invalid year provided' });
    }
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const activities = await Post.find({
      postedBy: userId,
      createdAt: {
        $gte: startOfYear,
        $lt: endOfYear,
      },
      isDeleted: false,
    }).select('createdAt -_id');
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error });
  }
});

// All
// Search post
export const searchPostWithCategoryIdController = asyncHandler(async (req: any, res: any) => {
  try {
    const queryOption = req.query;
    const searchPosts = await searchPostsWithCategoryService(req.params.categoryId, queryOption);
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
      error: 'Share post is not successfully',
    };
    return res.status(400).json(response);
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
    const queryOption = req.query;
    const result = await getPostsByUserIdService(postedBy as string, queryOption);
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
    return res.status(500).json(response);
  }
});

export const getPostsController = asyncHandler(async (req: AuthRequest, res: any) => {
  const queryOption = req.query;
  const userId = req.user?.userId;
  const { total, result } = await getPostsWithYearService(queryOption, userId as string);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
    total,
  };
  return res.status(200).json(response);
});

export const resolvePostByUserIdController = asyncHandler(async (req: AuthRequest, res: any) => {
  const postedBy = req.user?.userId;
  const { _id } = req.params;
  const result = await resolvePostByUserIdService(_id as string, postedBy as string);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

// --------------------------------------------------------------ADMIN------------------------------------------------------------------

export const postActivityDistributionController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    const queryOption = req.query;

    const result = await postActivityDistributionService(queryOption);
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
  },
);

export const getTotalActivePostsController = asyncHandler(async (req: AuthRequest, res: any) => {
  const total = await getTotalActivePostsService();
  const response: ResponseType<typeof total> = {
    success: true,
    data: total,
  };
  return res.status(200).json(response);
});

export const getTotalPostsController = asyncHandler(async (req: AuthRequest, res: any) => {
  const total = await getTotalPostsService();
  const response: ResponseType<typeof total> = {
    success: true,
    data: total,
  };
  return res.status(200).json(response);
});

export const getPostsDataDistributionByYearController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    const queryOption = req.query;
    const result = await getPostsDataDistributionByYearService(queryOption);
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
  },
);
export const getAllPostsController = asyncHandler(async (req: AuthRequest, res: any) => {
  const queryOption = req.query;
  const { result, total } = await getAllPostsService(queryOption);
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
    total: total,
  };
  return res.status(200).json(response);
});

export const getAllTotalDataInPostPageController = asyncHandler(
  async (req: AuthRequest, res: any) => {
    const result = await getAllTotalDataInPostPageService();
    const response: ResponseType<typeof result> = {
      success: true,
      data: result,
    };
    return res.status(200).json(response);
  },
);

export const getDataDailyPostsTrendController = asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await getDataDailyPostsTrendService();
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});

export const getDatePostsOverviewController = asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await getDatePostsOverviewService();
  const response: ResponseType<typeof result> = {
    success: true,
    data: result,
  };
  return res.status(200).json(response);
});
