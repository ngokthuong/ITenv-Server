import mongoose from "mongoose";
// Declare the Schema of the Mongo model
var accountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (email: String) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(String(email));
            },
            message: "Invalid email format"
        }
    }, password: {
        type: String
    },
    confirmPassword: {
        type: String
    },
    role: {
        type: String,
        default: 'user',
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    authenWith: {
        type: Number,
        require: true,
        min: 0,
        max: 3
    },
    passwordChangeAt: {
        type: String
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: String
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    }
}, { timestamps: true });

//Export the model
export default mongoose.model('Account', accountSchema);