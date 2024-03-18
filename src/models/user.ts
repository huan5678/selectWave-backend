import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import customEmitter, { passwordRule } from '@/utils';
import { IUser } from '@/types';


const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'email為必要資訊'],
      validate: {
        validator(value: string) {
          return validator.isEmail(value);
        },
        message: '請填寫正確 email 格式',
      },
      index: true,
      unique: true,
      lowercase: true,
      trim: true,
      select: false,
    },
    password: {
      type: String,
      minLength: [8, '密碼至少 8 個字'],
      required: [true, '密碼欄位，請確實填寫'],
      validate: {
        validator(v: string): boolean {
          return passwordRule.test(v);
        },
        message: '密碼需符合至少有 1 個數字， 1 個大寫英文， 1 個小寫英文, 1 個特殊符號，且長度至少為 8 個字元',
      },
      select: false,
    },
    webAuthnCredentials: [{
    credentialID: {
      type: Buffer,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    counter: {
      type: Number,
      required: true,
    }
  }],
    name: {
      type: String,
      minLength: [1, '名稱請大於 1 個字'],
      maxLength: [ 50, '名稱長度過長，最多只能 50 個字' ],
      default: `使用者 #${Math.floor(Math.random() * 1000000)}`,
    },
    avatar: {
      type: String,
      default: 'https://i.imgur.com/xcLTrkV.png',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'x'],
      default: 'x',
    },
    birthday: {
      type: Date,
    },
    followers: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    following: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    socialMedia: [
      {
        _id: false,
        type: {
          type: String,
        },
        id: {
          type: String,
        },
      },
    ],
    googleId: {
      type: String,
      select: false,
    },
    facebookId: {
      type: String,
      select: false,
    },
    lineId: {
      type: String,
      select: false,
    },
    discordId: {
      type: String,
      select: false,
    },
    githubId: {
      type: String,
      select: false,
    },
    isValidator: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: '',
      select: false,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    coin: {
      type: Number,
      default: 0,
      min: 0,
    },
    resetToken: {
      type: String,
      select: false,
    },
    likedPolls: [
      {
        _id: false,
        poll: {
          type: Schema.Types.ObjectId,
          ref: 'Poll',
        },
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ]
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) =>
      {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.resetToken;
        delete ret.verificationToken;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) =>
      {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.resetToken;
        delete ret.verificationToken;
        return ret;
      }
    },
  },
);

userSchema.pre('save', async function (next)
{
  // 如果密碼被修改了，則對密碼進行加密
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.post('save', async function() {
  if (this.isModified('followers')) {
    customEmitter.emit('userUpdated', {
      userId: this._id,
      followers: this.followers,
    });
  }
});

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetToken;
  delete user.verificationToken;
  return user;
};

export default model<IUser>('User', userSchema);
