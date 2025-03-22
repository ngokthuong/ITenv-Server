import tag from '../models/tag';
import { slugify } from '../utils/slugify.utils';
export const getAllTagsService = async (req: any) => {
  try {
    const tags = await tag.find({ isDeleted: false });
    return tags;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createTagService = async (data: any) => {
  try {
    const slug = slugify(data.name);
    const newData = { ...data, slug };
    const result = await tag.create(newData);
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
