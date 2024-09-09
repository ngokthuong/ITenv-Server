import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

// Định nghĩa interface cho dữ liệu của Account
interface IAccount extends Document {
    email: string;
    password: string;
    confirmPassword?: string;
    role: string;
    isActive: boolean;
    isBlocked: boolean;
    authenWith: number;
    passwordChangeAt?: string;
    passwordResetToken?: string;
    passwordResetExpires?: string;
    firstName: string;
    lastName: string;
    user: mongoose.Schema.Types.ObjectId;
}

// Định nghĩa Schema của Mongo model
const accountSchema: Schema<IAccount> = new Schema({
    email: {
        type: String,
        validate: {
            validator: (email: string) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            },
            message: "Invalid email format"
        }
    },
    password: {
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
        type: String
    },
    lastName: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Trước khi lưu thì thực hiện code trong callback (hash password)
// Mongo không đọc được `this` trong arrow function
accountSchema.pre<IAccount>('save', async function (next) {
    try {
        // if password is changed then hash new password
        if (!this.isModified('password')) {
            next()
        }
        // Tạo salt
        const salt = bcrypt.genSaltSync(10);
        // Hash password
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        console.error(error)
    }
});

// Export model
const Account = mongoose.model<IAccount>('Account', accountSchema);
export default Account;