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
