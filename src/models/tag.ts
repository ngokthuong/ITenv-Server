import mongoose, { Document, Schema } from 'mongoose';
import { EnumTag } from '../enums/schemaTag.enum';
import { slugify } from '../utils/slugify.utils';

interface ITag extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  description?: string;
  type?: EnumTag;
  slug: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: Object.values(EnumTag),
    },
    slug: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

TagSchema.pre<ITag>('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

export default mongoose.model<ITag>('Tag', TagSchema);
