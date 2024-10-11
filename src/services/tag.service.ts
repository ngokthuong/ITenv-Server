import tag from "../models/tag";
export const getAllTagsService = async (req: any) => {
    try {
        const tags = await tag.find();
        return tags;
    } catch (error) {
        throw new Error('Error retrieving tags');
    }
};
