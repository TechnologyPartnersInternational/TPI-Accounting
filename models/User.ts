import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'accountant', 'viewer'],
      default: 'accountant',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from compiling the model multiple times in development
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
