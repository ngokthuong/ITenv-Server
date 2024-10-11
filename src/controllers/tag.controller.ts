import { any } from 'joi';
import { getAllTagsService } from '../services/tag.service'
import { ResponseType } from '../types/Response.type'
import { timeStamp } from 'console';

export const getAllTagsController = async (req: any, res: any) => {
    try {
        const tags = await getAllTagsService(req);
        const totalTags = tags.length;
        const response: ResponseType<typeof tags> = {
            success: true,
            data: tags,
            total: totalTags,
            timeStamp: new Date()
        }
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
};