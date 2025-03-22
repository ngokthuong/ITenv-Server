import { boolean } from 'joi';
import { EnumTag } from '../enums/schemaTag.enum';
import category from '../models/category';
import post from '../models/post';

export const createCategoryService = async (data: any) => {
  try {
    const newCategory = await category.create(data);
    return newCategory;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCategoriesOfPosts = async () => {
  try {
    const categories = await category.find({ type: EnumTag.TYPE_POST, isDeleted: false });
    return categories;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCategoriesOfProblems = async () => {
  try {
    const categories = await category.find({ type: EnumTag.TYPE_PROBLEM, isDeleted: false });
    return categories;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateCategoryService = async (data: any) => {
  try {
    return await category.findByIdAndUpdate(data._id, { data }, { new: true, runValidators: true });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteCategoryService = async (idCategory: string) => {
  try {
    // delete
    const deletedCategory = await category.findByIdAndDelete(idCategory);
    // tat posts cua cate da xoa
    await post.updateMany({ categoryId: idCategory }, { $set: { isDeleted: true } });
    if (!deletedCategory) {
      throw new Error('Category not found');
    }
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
