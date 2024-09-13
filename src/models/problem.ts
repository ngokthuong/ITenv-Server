import mongoose from "mongoose";
import comment from "./comment";

// Định nghĩa schema cho trường `initialCode`
const initialCodeSchema = new mongoose.Schema({
    language: {
        type: String,
    },
    content: {
        type: String,
    }
});

const testCaseSchema = new mongoose.Schema({
    input: [
        {
            name: {
                type: String,
            },
            value: {
                type: String,
            }
        }
    ],
    output: {
        type: [String],
    }
});

// Declare the Schema of the Mongo model
var problemSchema = new mongoose.Schema({
    title: {
        type: String
    },
    content: {
        type: String
    },
    level: {
        type: String
    },
    tags: {
        type: [String],
        required: true
    },
    acceptance: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    submitBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    hint: {
        type: [String]
    },
    initialCode: {
        type: initialCodeSchema
    },
    testCase: {
        type: testCaseSchema
    },
    vote: {
        type: Number,
        default: 0
    },
    comment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    postAt: {
        type: Date,
        default: Date.now
    },
    editAt: {
        type: Date
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

//Export the model
export default mongoose.model('Problem', problemSchema);