import { createTagService, getAllTagsService } from '../services/tag.service';
import { ResponseType } from '../types/Response.type';

export const getAllTagsController = async (req: any, res: any) => {
  try {
    const tags = await getAllTagsService();
    const totalTags = tags.length;
    const response: ResponseType<typeof tags> = {
      success: true,
      data: tags,
      total: totalTags,
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
};

export const createTagController = async (req: any, res: any) => {
  const { name, description, type } = req.body;
  const tag = await createTagService({ name, description, type });
  if (tag) {
    const response: ResponseType<typeof tag> = {
      success: true,
      data: tag,
    };
    return res.status(200).json(response);
  }
  const response: ResponseType<typeof tag> = {
    success: false,
    data: tag,
  };
  return res.status(400).json(response);
};
