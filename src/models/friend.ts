import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var friendSchema = new mongoose.Schema({

    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPT', 'BLOCKED'], // Chỉ cho phép 3 giá trị này
        default: 'PENDING' // Giá trị mặc định khi không truyền vào
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: {
        type: Date,
        default: Date.now
    }
});

//Export the model
export default mongoose.model('Friend', friendSchema);