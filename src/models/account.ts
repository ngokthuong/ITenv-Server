import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from 'crypto';


// Định nghĩa interface cho dữ liệu của Account
interface IAccount extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    role: string;
    isBlocked: boolean;
    authenWith: number;
    passwordChangeAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    refreshToken: string;
    user: mongoose.Types.ObjectId;
    isCorrectPassword(password: string): Promise<boolean>;
    createPassChangeToken(): Promise<string>;
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
    role: {
        type: String,
        default: 'user',
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
        type: Date,
        default: Date.now
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date,
        default: Date.now
    },
    refreshToken: {
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
        const salt = await bcrypt.genSaltSync(10);
        // Hash password
        if (this.authenWith === 0)
            this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        console.error(error)
    }
});

// check pass in login
// all function được định nghĩa để sử dụng cho model
accountSchema.methods = {
    // use compare function to compare password user wirted and pass in db 
    isCorrectPassword: async function (password: string) {
        return await bcrypt.compare(password, this.password)
    },
    createPassChangeToken: async function () {
        const resetToken = await crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = await crypto.createHash('sha256').update(resetToken).digest('hex');
        this.passwordResetExpires = await Date.now() + 15 * 60 * 1000
        return resetToken
    }
}

export default mongoose.model<IAccount>('Account', accountSchema);
