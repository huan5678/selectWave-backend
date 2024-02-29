import { RequestHandler } from "express";
import { Tag } from "@/models";
import { appError, successHandle, validateInput } from "@/utils";
import { object, string } from "yup";
import { TagService } from "@/services";


const tagSchema = object({
  name: string().required("缺少標籤名稱"),
});

class TagController {
  public static createTag: RequestHandler = async (req, res, next) =>
  {
    const { name } = req.body;
    if (!(await validateInput(tagSchema, req.body, next))) return;
    
    try {
      const tag = await TagService.createTag(name);
      successHandle(res, "標籤創建成功", { result: tag });
    } catch (error) {
      throw appError({ code: 500, message: `標籤創建失敗 ${(error as Error).message}`, next });
    }
  }

  public static getTags: RequestHandler = async (req, res) =>
  {
    const { q, sort } = req.query;

    const queryConditions = {
        ...(q && {
            $or: [
                { name: { $regex: q, $options: "i" } },
            ],
        }),
    };

    const tags = await Tag.find(queryConditions)
      .sort(sort as string || { createdAt: -1 })
      .exec();
    successHandle(res, "成功取得標籤列表", { result: tags });
  }

  public static getTagById: RequestHandler = async (req, res, next) =>
  {
    try {
      const { id } = req.params;
      const tag = await Tag.findById(id).exec();
      if (!tag) throw appError({ code: 404, message: "無此標籤", next });
      successHandle(res, "成功取得標籤資訊", { result: tag });
    } catch (error) {
      throw appError({ code: 500, message: `無法取得標籤資訊 ${(error as Error).message}`, next });
    }
  }

  public static updateTag: RequestHandler = async (req, res, next) =>
  {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!(await validateInput(tagSchema, req.body, next))) return;
      const tag = await Tag.findByIdAndUpdate(id, { name }, { new: true }).exec();
      successHandle(res, "標籤更新成功", { result: tag });
    } catch (error) {
      throw appError({ code: 500, message: `標籤更新失敗 ${(error as Error).message}`, next });
    }
  }

  public static deleteTag: RequestHandler = async (req, res, next) =>
  {
    try {
      const { id } = req.params;
      await Tag.findByIdAndDelete(id).exec();
      successHandle(res, "標籤刪除成功", { result: null });
    } catch (error) {
      throw appError({ code: 500, message: `標籤刪除失敗 ${(error as Error).message}`, next });
    }
  }
}

export default TagController;
