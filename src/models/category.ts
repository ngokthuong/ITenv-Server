import mongoose, { Document, Schema } from "mongoose";
import { EnumTag } from '../enums/schemaTag.enum'

interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    parentCategory: mongoose.Types.ObjectId;
    description: string;
    type: EnumTag;
    isDeleted: boolean;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
    },
    name: {
        type: String,
        required: true,
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        enum: Object.values(EnumTag),
        required: true,
    },
    isDeleted: {
        type: Boolean,
        required: false,
    },
    slug: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);