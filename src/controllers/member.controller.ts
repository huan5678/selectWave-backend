import { RequestHandler } from "express";
import { appError, successHandle } from "@/utils";
import validator from "validator";
import { AuthService, MemberService } from "@/services";
import { IUser } from "../types/index";

class MemberController {
  public static getAllMembers: RequestHandler = async (req, res) =>
  {
    // 從查詢參數中獲取頁碼和限制數量，並確保它們是數字類型
    let page = parseInt(req.query.page as string, 10) || 1; // 預設為第1頁
    let limit = parseInt(req.query.limit as string, 10) || 10; // 預設限制為10

    // 獲取總用戶數，用於計算總頁數
    const totalCount = await MemberService.countMembers();
    const skip = (page - 1) * limit;

    // 添加skip和limit進行分頁
    const users = await MemberService.getAllMembers(skip, limit);
    // 計算總頁數
    const totalPages = Math.ceil(totalCount / limit);

    // 使用分頁後的結果回應
    return successHandle(res, "成功取得使用者列表", {
      result: { users, totalPages, currentPage: page, totalCount },
    });
  };

  public static getMemberById: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      throw appError({ code: 400, message: "請提供使用者 id", next });
    }
    const user = await MemberService.getMemberById(id, next);

    return successHandle(res, "成功取的使用者資訊", { result: user });
  };

  public static deleteMemberById: RequestHandler = async (req, res, next) =>
  {
    const { id } = req.params;
    await AuthService.deleteMemberById(id, next);
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
    const userData = await MemberService.updateMemberData(user.id, updateData);
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

    const result = MemberService.addMemberFollower(id, targetID, next);

    successHandle(res, "您已成功追蹤！", { result });
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

    const result = MemberService.deleteMemberFollower(id, targetID, next);

    successHandle(res, "取消追踪成功", {result});
  };
}

export default MemberController;
