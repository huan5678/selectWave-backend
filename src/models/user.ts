import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { passwordRule } from '@/utils';
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
      unique: true,
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
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
        virtuals: true
    },
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.findWithoutSensitiveData = function (query) {
  return this.find(query).select('-password -resetToken');
};

userSchema.pre(/^find/, function (next) {
  (this as IUser).populate({
    path: 'following.user',
    select: '-createdAt -following -isValidator -followers',
  });
  next();
});

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetToken;
  return user;
};

export default model<IUser>('User', userSchema);
