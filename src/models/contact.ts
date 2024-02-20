import { IContact } from '@/types';
import { Schema, model } from 'mongoose';

const contactSchema = new Schema<IContact>({
  emailSubscriber: [
    {
      _id: false,
      email: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  contact: [
    {
      _id: false,
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      quests: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, {
  timestamps: { createdAt: 'createdTime', updatedAt: 'updateTime' },
  versionKey: false,
    toJSON: {
      virtuals: true
    },
    toObject: {
        virtuals: true
    },
});

export default model<IContact>('Contact', contactSchema);
