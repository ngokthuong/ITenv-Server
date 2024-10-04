
import User from '../models/user';
import Account from '../models/account';

export const getCurrentUserService = async (req: any) => {
    const user = await User.findById(req?.user?.user).populate({
        path: 'account',
        select: 'role isBlocked email',
    });

    if (!user) {
        throw new Error('User not found');
    }

    const account = await Account.findById(req?.user?._id);

    const responseData = {
        username: user.username,
        dob: user.dob,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        posts: user.posts,
        notifications: user.notifications,
        submissions: user.submissions,
        gender: user.gender,
        status: user.status,
        lastOnline: user.lastOnline,
        email: account?.email,
        role: account?.role,
        isBlocked: account?.isBlocked,
    };

    return responseData;
};

export const getAllUsersService = async (pageNumber: number, limitNumber: number, search: string) => {
    const searchQuery = search
        ? {
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }
        : {};

    const users = await User.find(searchQuery)
        .populate({
            path: 'account',
            select: 'role isBlocked email',
        })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    const total = await User.countDocuments(searchQuery);

    return { total, users };
};

