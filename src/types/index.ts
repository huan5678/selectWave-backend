import type { Request, Response, RequestHandler } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  gender?: string;
  socialMedia?: [
    {
      type: string;
      id: string;
    },
  ];
  followers?: {
    userId: IUser['_id'];
    createdAt: Date;
  }[];
  following?: {
    userId: IUser['_id'];
    createdAt: Date;
  }[];
  createdAt?: Date;
  googleId?: string;
  facebookId?: string;
  lineId?: string;
  discordId?: string;
  verificationToken?: string;
  isValidator?: boolean;
  isSubscribed?: boolean;
  coin?: number;
  resetToken?: string;
}
export interface IPoll extends Document {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  createdBy: IUser;
  createdTime: Date;
  startDate: Date;
  endDate: Date;
  isPrivate: boolean;
  totalVoters: number;
  like: {
    userId: IUser['_id'];
  }[];
  comments: {
    commentId: IComment['_id'];
  }[];
  options: {
    optionId: IOption['_id'];
  }[];
}
export interface IOption extends Document {
  _id?: string;
  optionTitle: string;
  optionImageUrl: string;
  pollId: IPoll['_id'];
  voters: {
    userId: IUser['_id'];
    createdTime: Date;
  }[];
}

export interface IComment extends Document {
  _id?: string;
  userId: IUser['_id'];
  pollId: IPoll['_id'];
  content: string;
  createdTime: Date;
  role: 'author' | 'user';
  edited: boolean;
  updateTime: Date;
}

export interface ITokenBlacklist extends Document {
  _id?: string;
  token: string;
  expiresAt: Date;
}

export type ApiExcludeProps = {
  path: string;
  method: string;
};

export type ApiResponse<T = any> = Response<{
  status: number;
  success: boolean;
  message: string;
  result: T | null;
}>;

export type UserAuth = {
  sub: string;
  iat: number;
  exp: number;
  memberId: string;
  account: string;
  email?: string;
  role: string;
};

export type AuthRequest = Request & {
  auth: UserAuth;
};
export interface ResponseError extends Error {
  code?: number;
}

export type Data = {
  [key: string]: unknown;
};

export interface MailInterface {
  from?: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html: string;
}

export type HandleErrorAsyncProps = (func: Function) => RequestHandler;

export type ThirdPartyProfile = {
  id: string;
  name: string;
  email: string;
  picture: string;
};

export type TokenPayload = {
  userId: string;
  iat: number;
  exp: number;
};