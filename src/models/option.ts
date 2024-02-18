import { IOption } from '@/types';
import { Schema, model } from 'mongoose';

const optionSchema = new Schema<IOption>({
  title: {
    type: String,
    required: [true, '請填寫選項名稱'],
    minLength: [1, '選項名稱請大於 1 個字'],
    maxLength: [50, '選項名稱長度過長，最多只能 50 個字'],
  },
  imageUrl: {
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
  isWinner: {
    type: Boolean,
    default: false,
  }
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

optionSchema.pre(/^find/, function(next) {
  (this as IOption).populate([{
    path: 'voters',
    select: 'name avatar'
  }]);
  next();
});

export default model<IOption>('Option', optionSchema);
