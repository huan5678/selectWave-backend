import { NextFunction, RequestHandler, Response } from 'express';
import { User } from '@/models';
import { appError, successHandle } from '@/utils';
import validator from 'validator';

class MemberController {
  public static getAllMembers: RequestHandler = async (_req, res: Response) => {
    try {
      const users = await User.find().select('-password -resetToken').exec();
      successHandle(res, 'success', { ...users });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error' });
    }
  };

  public static getMemberById: RequestHandler = async (req, res: Response) => {
    const user = await User.findById(req.params.id).select('-password -resetToken').exec();
    if (!user) throw appError({ code: 404, message: 'user not found' });
    try {
      successHandle(res, 'success', { ...user });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error' });
    }
  };

  public static deleteMemberById: RequestHandler = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id).exec();
      if (!user) throw appError({ code: 404, message: 'user not found' });
      res.status(200).send({
        message: 'success',
        result: null,
      });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error' });
    }
  };

  public static updateProfile: RequestHandler = async (
    req,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.body.id;
    const validFields = ['name', 'avatar', 'gender', 'socialMedia'];
    let updateData = {};
    for (let field of validFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData['avatar'] && !validator.isURL(updateData['avatar'])) {
      appError({ code: 400, message: '請確認照片是否傳入網址', next });
    }
    await User.findByIdAndUpdate(userId, updateData, { runValidators: true });
    const userData = await User.findById(userId).select(['-password', '-resetToken']).exec();
    return successHandle(res, '成功更新使用者資訊！', { ...userData });
  };

  public static addFollower: RequestHandler = async (
    req: any,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      params: { id: targetID },
      user,
    } = req;
    if (!user || !user.id || targetID === user.id) {
      appError({ code: 401, message: '您無法追蹤自己', next });
    }
    await User.updateOne(
      {
        _id: user?.id,
        'following.user': { $ne: targetID },
      },
      {
        $addToSet: { following: { user: targetID } },
      },
    );
    await User.updateOne(
      {
        _id: targetID,
        'followers.user': { $ne: user?.id },
      },
      {
        $addToSet: { followers: { user: user?.id } },
      },
    );
    const resultUserData = await User.findById(user?.id).exec();
    return successHandle(res, '您已成功追蹤！', { ...resultUserData });
  };

  public static deleteFollower: RequestHandler = async (
    req: any,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      params: { id: targetID },
      user,
    } = req;
    if (!user || !user.id || targetID === user.id) {
      appError({ code: 401, message: '您無法取消追蹤自己', next });
    }
    await User.updateOne(
      {
        _id: user?.id,
      },
      {
        $pull: { following: { user: targetID } },
      },
    );
    await User.updateOne(
      {
        _id: targetID,
      },
      {
        $pull: { followers: { user: user?.id } },
      },
    );
    const resultUserData = await User.findById(user?.id).exec();
    return successHandle(res, '您已成功取消追蹤！', { ...resultUserData });
  };

  public static getFollowers: RequestHandler = async (req, res: Response) => {
    const {
      params: { id: targetID },
    } = req;
    const followers = await User.findById(targetID, { followers: 1 }).exec();
    return successHandle(res, '成功取得追蹤者名單', { ...followers });
  };
}

export default MemberController;
