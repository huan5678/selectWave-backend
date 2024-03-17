import { Schema, model } from 'mongoose';
import { IComment } from '@/types';

const replySchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 200
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  edited: {
    type: Boolean,
    default: false,
  },
  createdTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {
    type: Date,
    default: Date.now
  },
  replies: [ {
    type: Schema.Types.ObjectId,
    ref: 'Reply',
  }]
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

replySchema.pre(/^find/, function(next) {
  (this as IComment).populate([{
    path: 'author',
    select: 'name avatar'
  }]);
  next();
});


replySchema.index({ author: 1 });

export default model<IComment>('Reply', replySchema);