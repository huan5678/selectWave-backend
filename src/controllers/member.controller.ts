import { RequestHandler } from "express";
import { User } from "@/models";
import { appError, successHandle } from "@/utils";
import validator from "validator";
import { AuthService } from "@/services";

class MemberController {
  public static getAllMembers: RequestHandler = async (req, res) => {
    // 從查詢參數中獲取頁碼和限制數量，並確保它們是數字類型
    let page = parseInt(req.query.page as string, 10) || 1; // 預設為第1頁
    let limit = parseInt(req.query.limit as string, 10) || 10; // 預設限制為10

    // 獲取總用戶數，用於計算總頁數
    const totalCount = await User.countDocuments();

    // 添加skip和limit進行分頁
    const users = await User.find()
      .select(
        "-gender -coin -followers -following -socialMedia -updatedAt -isValidator -isSubscribed"
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // 計算總頁數
    const totalPages = Math.ceil(totalCount / limit);

    // 使用分頁後的結果回應
    return successHandle(res, "成功取得使用者列表", {
      result: { users, totalPages, currentPage: page, totalCount },
    });
  };

  public static getMemberById: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id).select('-coin -updatedAt -isValidator -isSubscribed').exec();
    if (!user)
      throw appError({
        code: 404,
        message: "無此使用者請確認使用者 id 是否正確",
        next,
      });
    return successHandle(res, "成功取的使用者資訊", { result: user });
  };

  public static deleteMemberById: RequestHandler = async (req, res, next) => {
    await AuthService.deleteMemberById(req.params.id, next);
    return successHandle(res, "成功刪除使用者", { result: null });
  };

  public static updateProfile: RequestHandler = async (req: any, res, next) => {
    const { user } = req;
    const validFields = ["name", "avatar", "gender", "socialMedia"];
    let updateData = {};
    for (let field of validFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData["avatar"] && !validator.isURL(updateData["avatar"])) {
      throw appError({ code: 400, message: "請確認照片是否傳入網址", next });
    }
    const userData = await User.findByIdAndUpdate(user.id, updateData, { new: true, runValidators: true }).select('-coin -updatedAt -isValidator -isSubscribed')
      .exec();
    return successHandle(res, "成功更新使用者資訊！", { result: userData });
  };

  public static addFollower: RequestHandler = async (req: any, res, next) => {
    const {
      params: { id: targetID },
      user,
    } = req;
    if (!targetID)
      throw appError({ code: 400, message: "請提供使用者 id", next });
    if (targetID === user.id) {
      throw appError({ code: 401, message: "您無法追蹤自己", next });
    }

    // 檢查是否已追蹤該使用者
    const existingFollower = await User.findOne({
      _id: user?.id,
      "following.user": targetID,
    }).exec();
    if (existingFollower) {
      throw appError({ code: 400, message: "您已經追蹤了該使用者", next });
    }

    const resultUserData = await User.findOneAndUpdate(
      { _id: user?.id, "following.user": { $ne: targetID } },
      { $addToSet: { following: { user: targetID } } },
      { new: true }
    ).select('-coin -updatedAt -isValidator -isSubscribed').exec();

    await User.findOneAndUpdate(
      { _id: targetID, "followers.user": { $ne: user?.id } },
      { $addToSet: { followers: { user: user?.id } } }
    );

    return successHandle(res, "您已成功追蹤！", { result: resultUserData });
  };

  public static deleteFollower: RequestHandler = async (
    req: any,
    res,
    next
  ) => {
    const {
      params: { id: targetID },
      user,
    } = req;
    if (!targetID)
      throw appError({ code: 400, message: "請提供使用者 id", next });
    if (targetID === user.id) {
      throw appError({ code: 401, message: "您無法取消追蹤自己", next });
    }

    // 檢查是否已追蹤該使用者
    const existingFollowing = await User.findOne({
      _id: user?.id,
      "following.user": targetID,
    }).exec();
    if (!existingFollowing) {
      throw appError({
        code: 400,
        message: "您尚未追蹤該使用者，無法取消追蹤",
        next,
      });
    }

    const resultUserData = await User.findByIdAndUpdate(
      user?.id,
      {
        $pull: { following: { user: targetID } },
      },
      { new: true }
    ).select('-coin -updatedAt -isValidator -isSubscribed').exec();

    await User.findByIdAndUpdate(targetID, {
      $pull: { followers: { user: user?.id } },
    });

    return successHandle(res, "您已成功取消追蹤！", {
      result: resultUserData,
    });
  };
}

export default MemberController;
