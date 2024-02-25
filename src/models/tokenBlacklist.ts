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
},{
  versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret)
      {
        ret.id = ret._id;
        delete ret._id;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret)
      {
        ret.id = ret._id;
        delete ret._id;
      }
    },
});

export default model<ITokenBlacklist>('TokenBlacklist', tokenBlacklistSchema);
