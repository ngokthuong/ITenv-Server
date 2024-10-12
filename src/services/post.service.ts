import { find } from "lodash";
import post from "../models/post";
import { findUserById } from "./user.service";
export const createPostService = async (data: any) => {
    try {
        const newPost = await post.create(data);
        if (data.isAnonymous) {
            return newPost;
        }
        const currentUser = await findUserById(data.postBy);
        if (currentUser) {
            return {
                postBy: newPost.postBy,
                username: currentUser.username,
                userAvatar: currentUser.avatar,
                userStatus: currentUser.status,
                title: newPost.title,
                content: newPost.content,
                isAnonymous: newPost.isAnonymous,
                postStatus: newPost.status,
                tags: newPost.tags,
                categoryId: newPost.categoryId
            }
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// have pagination
export const getPostsWithCategoryIdService = async (categoryId: string, page: number) => {
    try {
        const limit = 15;
        const skip = (page - 1) * limit;
        // get all posts with categoryId and pagination
        const posts = await post.find({ categoryId })
            .skip(skip)
            .limit(limit);
        const tags = getAllTagsInPostsWithCateService(categoryId);
        // total posts with cateId
        const totalPosts = await post.countDocuments({ categoryId });
        // totalPages
        const totalPages = Math.ceil(totalPosts / limit);
        return {
            posts,
            totalPages,
            tags: tags,
            currentPage: page
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export const getAllTagsInPostsWithCateService = async (categoryID: string) => {
    try {
        // get all tags in posts with categoryID
        const tags = await post.aggregate([
            // filter with cateID
            { $match: { categoryID } },
            { $match: { tag: { $ne: null } } },
            // get each tag in array
            { $unwind: "$tags" },
            // gross all tags and remove duplicate
            { $group: { _id: null, tags: { $addToSet: "$tags" } } },
            // get only tags 
            { $project: { _id: 0, tags: 1 } }
        ]);
        console.log("Tags aggregation result:", tags);

        return tags;
    } catch (error: any) {
        throw new Error(error.message);
    }
}