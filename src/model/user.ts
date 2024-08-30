import mongoose from "mongoose"; // Erase if already required
import accountSchema from "./account"
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        require: true
    },
    username: {
        type: String,
        required: true
    },
    dob: {
        type: Date
    },
    phoneNumber: {
        type: String
    },
    avatar: {
        type: String
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post' // Tham chiếu đến schema User
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Tham chiếu đến schema User
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Tham chiếu đến schema User
    }],
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification' // Tham chiếu đến schema User
    }],
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission' // Tham chiếu đến schema User
    }],
    refreshToken: {
        type: String,
        require: true
    }

}, { timestamps: true });

//Export the model
export default mongoose.model('User', userSchema);