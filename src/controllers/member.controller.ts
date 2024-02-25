import { RequestHandler } from "express";
import { User } from "@/models";
import { appError, successHandle } from "@/utils";
import validator from "validator";
import { AuthService } from "@/services";
import { IUser } from "../types/index";

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
        "-gender -birthday -coin -followers -following -socialMedia -updatedAt -isValidator -isSubscribed -likedPolls"
      )
      .skip((page - 1) * limit)
      .limit(limit);
    // 計算總頁數
    const totalPages = Math.ceil(totalCount / limit);

    // 使用分頁後的結果回應
    return successHandle(res, "成功取得使用者列表", {
      result: { users, totalPages, currentPage: page, totalCount },
    });
  };

  public static getMemberById: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("-coin -updatedAt -isValidator")
      .populate({
        path: 'likedPolls.poll',
        select: {createdBy: 0, like: 0, comments: 0, options: 0, isPrivate: 0, createdTime: 0, createdAt: 0, updatedAt: 0}
      })
      .populate({
        path: 'comments',
        select: {createdBy: 0, like: 0, comments: 0, options: 0, isPrivate: 0, createdTime: 0, createdAt: 0, updatedAt: 0}
      })
      .exec();
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
    const validFields = ["name", "avatar", "gender", "socialMedia" , "birthday"];
    let updateData = {};
    for (let field of validFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData["avatar"] && !validator.isURL(updateData["avatar"])) {
      throw appError({ code: 400, message: "請確認照片是否傳入網址", next });
    }
    const userData = await User.findByIdAndUpdate(user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-coin -updatedAt -isValidator -isSubscribed");
    return successHandle(res, "成功更新使用者資訊！", { result: userData });
  };

  public static addFollower: RequestHandler = async (req, res, next) => {
    const {
      params: { id: targetID },
    } = req;
    const { id } = req.user as IUser;

    if (!targetID)
      throw appError({ code: 400, message: "請提供使用者 id", next });
    if (targetID === id)
      throw appError({ code: 401, message: "您無法追蹤自己", next });

    const user = await User.findById(id);
    if (!user) throw appError({ code: 404, message: "找不到使用者", next });
    const isAlreadyFollowing =
      user.following &&
      user.following.some(
        (following) => following.user.id.toString() === targetID
      );
    if (isAlreadyFollowing)
      throw appError({ code: 400, message: "您已經追蹤了該使用者", next });

    const resultUserData = await User.findOneAndUpdate(
      { id, "following.user": { $ne: targetID } },
      { $addToSet: { following: { user: targetID } } },
      { new: true }
    ).select("-coin -updatedAt -isValidator -isSubscribed");

    await User.findOneAndUpdate(
      { id: targetID },
      { $addToSet: { followers: { user: id } } }
    );

    successHandle(res, "您已成功追蹤！", { result: resultUserData });
  };

  public static deleteFollower: RequestHandler = async (req, res, next) => {
    const {
      params: { id: targetID },
    } = req;
    const { id } = req.user as IUser;

    if (!targetID)
      throw appError({ code: 400, message: "請提供使用者 id", next });
    if (targetID === id)
      throw appError({ code: 401, message: "您無法取消追蹤自己", next });

    const user = await User.findById(id);
    if (!user) throw appError({ code: 404, message: "找不到使用者", next });

    const isFollowing =
      user.following &&
      user.following.some(
        (following) => following.user.id.toString() === targetID
      );
    if (!isFollowing)
      throw appError({
        code: 400,
        message: "您尚未追蹤該使用者，無法取消追蹤",
        next,
      });

    await User.findOneAndUpdate(
      { id: id },
      { $pull: { following: { user: targetID } } }
    );

    await User.findOneAndUpdate(
      { id: targetID },
      { $pull: { followers: { user: id } } }
    );

    successHandle(res, "取消追踪成功", {});
  };
}

export default MemberController;
