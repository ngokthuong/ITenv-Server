import tag from "../models/tag";
export const getAllTagsService = async (req: any) => {
    try {
        const tags = await tag.find({ isDeleted: false });
        return tags;
    } catch (error: any) {
        throw new Error(error.message);
    }
};
