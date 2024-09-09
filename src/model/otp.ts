import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    code: {
        type: String
    },
    expriedOtp: {
        type: Date,
        required: true,
        // TTL index: MongoDB sẽ tự động xóa tài liệu sau khi trường expiredOtp hết hạn
        index: { expires: '5m' } // 5 phút sau khi OTP được tạo
    },
    codeLimit: {
        type: Number,
        default: 5
    }
});

//Export the model
export default mongoose.model('Otp', otpSchema);