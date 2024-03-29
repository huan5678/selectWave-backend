import type { Request, Response, RequestHandler } from "express";
import { Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  message: string;
  quests: string;
  createdAt: Date;
}

export interface IEmailSubscriber extends Document {
  email: string;
  createdAt: Date;
  unScribedToken: string;
}

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  webAuthnCredentials: {
    credentialID: Buffer;
    publicKey: string;
    counter: number;
  }[];
  avatar: string;
  gender: "male" | "female" | "x";
  birthday?: Date;
  socialMedia?: [
    {
      type: string;
      id: string;
    }
  ];
  followedUsers?: {
    user: IUser["_id"];
    createdAt: Date;
  }[];
  followingUsers?: {
    user: IUser["_id"];
    createdAt: Date;
  }[];
  isValidator: boolean;
  verificationToken: string;
  isSubscribed: boolean;
  createdAt: Date;
  coin: number;
  resetToken?: string;
  googleId?: string;
  facebookId?: string;
  lineId?: string;
  discordId?: string;
  githubId?: string;
  comments: IComment[ "_id" ][];
  followPolls: IPoll[ "_id" ][];
  likedPolls: IPoll["_id"][];
  likedComments: IComment[ "_id" ][];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  gender?: "male" | "female" | "x";
  socialMedia?: Array<{ type: string; id: string }>;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  gender?: "male" | "female" | "x";
}
export interface IPoll extends Document {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  createdBy: IUser;
  createdTime: Date;
  startDate: Date | null;
  endDate: Date | null;
  isPrivate: boolean;
  totalVoters: number;
  like: {
    emoji: string;
    user: IUser["_id"];
  }[];
  comments: {
    comment: IComment["_id"];
  }[];
  options: {
    optionId: IVote["_id"];
  }[];
  status: "pending" | "active" | "ended" | "closed";
  isWinner: {
    option: IVote["_id"];
  }[];
  followers: IUser[ "_id" ][];
}

export interface CreatePollRequest {
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
  createdBy: IUser["_id"];
  isPrivate?: boolean;
  options?: {
    title: string;
    imageUrl?: string;
  }[];
  status?: "pending" | "active";
}

export interface IVote extends Document {
  id: string;
  title: string;
  imageUrl: string;
  pollId: IPoll["_id"];
  voters: {
    user: IUser["_id"];
    createdTime: Date;
  }[];
  isWinner: boolean;
}

export interface IOption {
  title: string;
  imageUrl?: string;
  id?: string;
}

export interface CreateOptionRequest {
  optionTitle: string;
  optionImageUrl?: string;
  pollId: string;
}

export interface IComment extends Document {
  id: string;
  author: IUser["_id"];
  pollId: IPoll["_id"];
  content: string;
  createdTime: Date;
  edited: boolean;
  updateTime: Date;
  replies: IComment[];
  commentId: IComment[ "_id" ];
  isReply: boolean;
  likers: {
    emoji: string;
    user: IUser["_id"];
  }[];
}

export interface ITag extends Document {
  id: string;
  name: string;
  createdAt: Date;
  usageCount: number;
}

export interface CreateCommentRequest {
  pollId: string;
  userId: string;
  content: string;
}

export interface ITokenBlacklist extends Document {
  id: string;
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

export type ModelType = 'User' | 'Poll' | 'Comment' | 'Tag' | 'Vote';
export type Model = IUser | IPoll | IComment | ITag | IVote;
export type ModelSelect<T> = T extends 'User' ? IUser : T extends 'Poll' ? IPoll : T extends 'Comment' ? IComment : T extends 'Tag' ? ITag : IVote;

declare global {
  namespace Express {
    export interface Request {
      headers: {
        authorization?: string;
      };
      user?: IUser;
      path?: string;
      body?: {
        poll?: CreatePollRequest;
        optionsData?: CreateOptionRequest[];
        optionId?: string;
        newOptionId?: string;
      };
    }
  }
}
