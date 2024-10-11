import { any } from 'joi';
import { getAllTagsService } from '../services/tag.service'

export const getAllTagsController = async (req: any, res: any) => {
    try {
        const tags = await getAllTagsService(req);
        res.status(200).json(tags);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};