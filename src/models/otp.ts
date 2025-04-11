import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

interface IOtp extends Document {
  email: string;
  otp: string;
  expiredOtp: Date;
  createdAt: Date;
  updatedAt: Date;
  isCorrectOtp(otp: string): Promise<boolean>;
}

const otpSchema: Schema<IOtp> = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
  },
  expiredOtp: {
    type: Date,
    default: Date.now,
    index: { expires: '120s' },
  },
});

otpSchema.pre<IOtp>('save', async function (next) {
  try {
    const salt = bcrypt.genSaltSync(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error) {
    console.error(error);
  }
});

otpSchema.methods = {
  isCorrectOtp: async function (otp: string) {
    return await bcrypt.compare(otp, this.otp);
  },
};

export default mongoose.model<IOtp>('Otp', otpSchema);
