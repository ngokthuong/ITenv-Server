import asyncHandler from 'express-async-handler';
import { ResponseType } from '../types/Response.type';
import {
  createCategoryService,
  deleteCategoryService,
  getCategoriesOfPosts,
  getCategoriesOfProblems,
  updateCategoryService,
} from '../services/category.service';
import { AuthRequest } from '../types/AuthRequest.type';
import { slugify } from '../utils/slugify.utils';

// ADMIN
export const createCategoryController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const { name, parentCategory, description, type } = await req.body;
    const slug = slugify(name);
    const createCategory = await createCategoryService({
      name,
      parentCategory,
      description,
      type,
      slug,
    });
    const response: ResponseType<typeof createCategory> = {
      success: true,
      data: createCategory,
    };
    return res.status(201).json(response);
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
export const findCatesOfPostsController = asyncHandler(async (req: any, res: any) => {
  try {
    const categories = await getCategoriesOfPosts();
    const response: ResponseType<typeof categories> = {
      success: true,
      data: categories,
      message: 'cate',
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

// All
export const findCatesOfProblemsController = asyncHandler(async (req: any, res: any) => {
  try {
    const categories = await getCategoriesOfProblems();
    const response: ResponseType<typeof categories> = {
      success: true,
      data: categories,
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

// ADMIN
export const updateCategoryController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const { _id, name, parentCategory, description } = await req.body;
    const updateCategory = await updateCategoryService({ _id, name, parentCategory, description });
    const response: ResponseType<typeof updateCategory> = {
      success: true,
      data: updateCategory,
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

// ADMIN
export const deleteCategoryController = asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const idCategory = await req.params.idCategory;
    await deleteCategoryService(idCategory);
    const response: ResponseType<null> = {
      success: true,
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
