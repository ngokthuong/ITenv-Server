import mongoose, { Document, Schema } from "mongoose";
import { EnumTag } from '../enums/schemaTag.enum'

interface ITag extends Document {
    _id: mongoose.Types.ObjectId;
    name?: string;
    description?: string;
    type?: EnumTag;
    slug: string;
    isDeleted: boolean;
}

const TagSchema = new Schema<ITag>({
    name: {
        type: String,
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: Object.values(EnumTag)
    },
    slug: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

export default mongoose.model<ITag>("Tag", TagSchema);
