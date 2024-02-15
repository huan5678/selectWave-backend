import { IOption } from '@/types';
import { Schema, model } from 'mongoose';

const optionSchema = new Schema<IOption>({
  optionTitle: {
    type: String,
    required: [true, '請填寫選項名稱'],
    minLength: [1, '選項名稱請大於 1 個字'],
    maxLength: [50, '選項名稱長度過長，最多只能 50 個字'],
  },
  optionImageUrl: {
    type: String,
    default: 'https://imgur.com/TECsq2J.png',
  },
  pollId: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: [true, 'Poll ID is required'],
  },
  voters: [
    {
      _id: false,
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      createdTime: {
        type: Date,
        default: Date.now,
      },
      updatedTime: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default model<IOption>('Option', optionSchema);
