import mongoose, { Document, Schema } from "mongoose";

interface IInitialCode {
    language: string;
    content: string;
}

interface ITestCase {
    input: {
        name: string;
        value: string;
    }[];
    output: string[];
}

export interface IProblem extends Document {
    title: string;
    content: string;
    level: string;
    tags: string[];
    acceptance: mongoose.Types.ObjectId[];
    submitBy: mongoose.Types.ObjectId[];
    hint: string[];
    initialCode: IInitialCode;
    testCase: ITestCase;
    vote: number;
    comment: mongoose.Types.ObjectId[];
    postAt: Date;
    editAt?: Date;
    status: boolean;
}

const initialCodeSchema: Schema<IInitialCode> = new mongoose.Schema({
    language: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

const testCaseSchema: Schema<ITestCase> = new mongoose.Schema({
    input: [
        {
            name: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        }
    ],
    output: {
        type: [String],
        required: true
    }
});

const problemSchema: Schema<IProblem> = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
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
        type: initialCodeSchema,
        required: true
    },
    testCase: {
        type: testCaseSchema,
        required: true
    },
    vote: {
        type: Number,
        default: 0
    },
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
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

export default mongoose.model<IProblem>('Problem', problemSchema);
