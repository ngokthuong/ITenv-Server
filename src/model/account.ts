import mongoose from "mongoose";
// Declare the Schema of the Mongo model
var accountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        // validate: {
        //     validator: (email: any) => {
        //         return true
        //     },
        //     message: "Invalid email format"
        // }
    }, password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    isActive: {
        type: Boolean,
        require: true
    },
    isBlocked: {
        type: Boolean,
        require: true
    },
    authenWith: {
        type: String,
        require: true
    },
    passwordChangeAt: {
        type: String
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: String
    }
}, { timestamps: true });

//Export the model
export default mongoose.model('Account', accountSchema);