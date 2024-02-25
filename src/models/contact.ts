import { IContact, IEmailSubscriber } from '@/types';
import { Schema, model } from 'mongoose';

const contactSchema = new Schema<IContact>({
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
}, {
  timestamps: { createdAt: 'createdTime', updatedAt: 'updateTime' },
  versionKey: false,
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

const subscriberSchema = new Schema<IEmailSubscriber>({
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  unScribedToken: {
    type: String,
    default: '',
    select: false,
  },
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

export const Contact = model<IContact>('Contact', contactSchema);
export const EmailSubscriber = model<IEmailSubscriber>('EmailSubscriber', subscriberSchema);
