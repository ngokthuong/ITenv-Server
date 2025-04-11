import mongoose, { Document, Schema } from 'mongoose';
import { EnumTag } from '../enums/schemaTag.enum';
import { slugify } from '../utils/slugify.utils';

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

const CategorySchema: Schema<ICategory> = new Schema(
  {
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
      default: EnumTag.TYPE_PROBLEM,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      required: false,
    },
    slug: {
      type: String,
    },
  },
  { timestamps: true },
);

CategorySchema.pre<ICategory>('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

export default mongoose.model<ICategory>('Category', CategorySchema);
