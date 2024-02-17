import { RequestHandler } from 'express';
import { User } from '@/models';
import { appError, successHandle } from '@/utils';
import validator from 'validator';
import { AuthService } from '@/services';

class MemberController {
  public static getAllMembers: RequestHandler = async (req, res, next) => {
    try {
      // 從查詢參數中獲取頁碼和限制數量，並確保它們是數字類型
      let page = parseInt(req.query.page as string, 10) || 1; // 預設為第1頁
      let limit = parseInt(req.query.limit as string, 10) || 10; // 預設限制為10

      // 獲取總用戶數，用於計算總頁數
      const totalCount = await User.countDocuments();

      // 添加skip和limit進行分頁
      const users = await User.find()
        .select('-gender -coin -followers -following -socialMedia -updatedAt -isValidator -isSubscribed')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      // 計算總頁數
      const totalPages = Math.ceil(totalCount / limit);

      // 使用分頁後的結果回應
      successHandle(res, '成功取得使用者列表', { result: { users, totalPages, currentPage: page, totalCount } });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error', next });
    }
};


  public static getMemberById: RequestHandler = async (req, res, next) =>
  {
    try {
      const { id } = req.params;
      const user = await User.findById(id).exec();
    if (!user) throw appError({ code: 404, message: '無此使用者請確認使用者 id 是否正確', next });
      successHandle(res, '成功取的使用者資訊', { result:user });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error', next });
    }
  };

  public static deleteMemberById: RequestHandler = async (req, res, next) => {
    try {
      await AuthService.deleteMemberById(req.params.id, next);
      res.status(200).send({
        message: '成功刪除使用者',
        result: null,
      });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error', next });
    }
  };

  public static updateProfile: RequestHandler = async (
    req,
    res,
    next
  ) =>
  {
    try {
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
      return successHandle(res, '成功更新使用者資訊！', { result: userData });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error', next });
    }
  };

  public static addFollower: RequestHandler = async (
    req: any,
    res,
    next,
  ) =>
  {
    try {
    const {
      params: { id: targetID },
      user,
    } = req;
    if (!user || !user.id || targetID === user.id) {
      appError({ code: 401, message: '您無法追蹤自己', next });
    }
    await User.findByIdAndUpdate(user?.id, { $addToSet: { following: { user: targetID } } });
    await User.findByIdAndUpdate(targetID, { $addToSet: { followers: { user: user?.id } } });
    const resultUserData = await User.findById(user?.id).exec();
      return successHandle(res, '您已成功追蹤！', { result: resultUserData });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error', next });
    }
  };

  public static deleteFollower: RequestHandler = async (
    req: any,
    res,
    next,
  ) =>
  {
    try {
    const {
      params: { id: targetID },
      user,
    } = req;
    if (targetID === user.id) {
      appError({ code: 401, message: '您無法取消追蹤自己', next });
    }
      await User.findByIdAndUpdate(user?.id, { $pull: { following: { user: targetID } } });
      await User.findByIdAndUpdate(targetID, { $pull: { followers: { user: user?.id } } });
    const resultUserData = await User.findById(user?.id).exec();
      return successHandle(res, '您已成功取消追蹤！', { result: resultUserData  });
    } catch (error) {
      appError({ code: 500, message: 'Internal server error', next });
    }
  };
}

export default MemberController;
