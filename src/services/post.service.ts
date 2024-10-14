import { find } from "lodash";
import post from "../models/post";
import { findUserById } from "./user.service";
import { QueryOption } from "../types/queryOption.type";

export const createPostService = async (data: any) => {
    try {
        if (data.isAnonymous) {
            const newPost = await post.create(data);
            const result = await post.findById(newPost._id).select('-postedBy');
            return result;
        }
        const currentUser = await findUserById(data.postedBy);
        if (currentUser) {
            const newPost = (await post.create(data)).populate('postedBy', 'username avatar status');
            return newPost
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// have pagination
export const getPostsWithCategoryIdService = async (categoryId: string, queryOption: QueryOption) => {
    try {
        const limit = queryOption.pageSize || 10;
        const skip = (queryOption.page || 1 - 1) * limit;
        // get all posts with categor   yId and pagination
        const posts = await post.find({ categoryId })
            .skip(skip)
            .limit(limit);
        // const tags = getAllTagsInPostsWithCateService(categoryId);
        // total posts with cateId
        const totalPosts = await post.countDocuments({ categoryId });
        // totalPages
        // const totalPages = Math.ceil(totalPosts / limit);
        return {
            posts,
            totalPosts
            // totalPages,
            // // tags: tags,
            // currentPage: page
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export const getPostByIdService = async (postId: string) => {
    try {
        if (postId)
            return post.findById(postId);
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
        return tags;
    } catch (error: any) {
        throw new Error(error.message);
    }
}


// edit

export const editPostByIdService = async (_id: string, data: any) => {
    try {
        const editPost = await post.findByIdAndUpdate(_id, data, { new: true });
        console.log(editPost);
        if (data.isAnonymous) {
            return editPost;
        }
        const currentUser = await findUserById(data.postedBy);
        if (currentUser) {
            return {
                postedBy: editPost?.postedBy,
                username: currentUser.username,
                userAvatar: currentUser.avatar,
                userStatus: currentUser.status,
                title: editPost?.title,
                content: editPost?.content,
                isAnonymous: editPost?.isAnonymous,
                postStatus: editPost?.status,
                tags: editPost?.tags,
                categoryId: editPost?.categoryId
            }
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};