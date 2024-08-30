import mongoose from "mongoose";

const codeSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true // Bắt buộc phải có giá trị
    },
    content: {
        type: String
    }
});
// Declare the Schema of the Mongo model
var submissionSchema = new mongoose.Schema({
    submitBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    code: {
        type: codeSchema
    },
    score: {
        type: Number
    },
    isAcceped: {
        type: Boolean
    },
    submitAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

//Export the model
export default mongoose.model('Submission', submissionSchema);