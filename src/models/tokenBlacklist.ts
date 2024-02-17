import { ITokenBlacklist } from '@/types';
import { Schema, model } from 'mongoose';

const tokenBlacklistSchema = new Schema<ITokenBlacklist>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
        virtuals: true
    },
});

export default model<ITokenBlacklist>('TokenBlacklist', tokenBlacklistSchema);
