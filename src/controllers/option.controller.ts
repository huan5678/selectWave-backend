import { RequestHandler } from "express";
import { Poll, Option, User } from "@/models";
import { appError, successHandle } from "@/utils";
import { IUser } from "@/types";
import { array, object, string } from "yup";

const optionArraySchema = array(
  object({
    title: string()
      .required("請填寫選項名稱")
      .min(1, "選項名稱請大於 1 個字")
      .max(50, "選項名稱長度過長，最多只能 50 個字"),
    imageUrl: string().default("https://imgur.com/TECsq2J.png"),
  })
);

const optionSchema = object({
  title: string()
    .required("請填寫選項名稱")
    .min(1, "選項名稱請大於 1 個字")
    .max(50, "選項名稱長度過長，最多只能 50 個字"),
  imageUrl: string().default("https://imgur.com/TECsq2J.png"),
});
class OptionController {
  // 投票
  public static vote: RequestHandler = async (req, res, next) => {
    const { optionId } = req.body;
    const { id } = req.user as IUser;
    const poll = await Poll.findOne({ options: optionId });
    const option = await Option.findById(optionId);
    const user = await User.findOne({ _id: id });

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "active") {
      throw appError({ code: 400, message: "投票未開始或是已結束", next });
    }
    // 檢查是否已經投過票
    if (!option) {
      throw appError({ code: 404, message: "找不到選項", next });
    }
    if (option?.voters.some((voter) => voter.user.toString() === id)) {
      throw appError({ code: 400, message: "您已經對此選項投過票", next });
    }

    // 添加投票者
    const updatedOption = await Option.findByIdAndUpdate(
      optionId,
      { $push: { voters: { user, createdTime: new Date() } } },
      { new: true }
    )
      .populate("voters.user", "name avatar")
      .exec();

    successHandle(res, "投票成功", { updatedOption });
  };

  // 更改投票
  public static updateVote: RequestHandler = async (req, res, next) => {
    const { id } = req.user as IUser;
    const { id: optionId } = req.params;
    const { newOptionId } = req.body;

    const option = await Option.findById(optionId);
    const user = await User.findOne({ _id: id });
    const poll = await Poll.findOne({ options: optionId });

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "active") {
      throw appError({ code: 400, message: "投票未開始或是已結束", next });
    }
    // 檢查是否已經投過票
    if (!option) {
      throw appError({ code: 404, message: "找不到選項", next });
    }
    const voter = option.voters.find((voter) => voter.user.toString() === id);
    if (!voter) {
      throw appError({ code: 400, message: "找不到投票者", next });
    }

    option.voters = option.voters.filter(
      (voter) => voter.user.toString() !== id
    );

    const newOption = await Option.findById(newOptionId);
    if (!newOption) {
      throw appError({ code: 404, message: "找不到新投票選項", next });
    }
    const updatedNewOption = await Option.findByIdAndUpdate(
      newOptionId,
      { $push: { voters: { user, createdTime: new Date() } } },
      { new: true }
    )
      .populate("voters.user", "name avatar")
      .exec();
    await option.save();

    successHandle(res, "更改投票成功", { updatedNewOption });
  };

  // 取消投票
  public static cancelVote: RequestHandler = async (req, res, next) => {
    const { id } = req.user as IUser;
    const { id: optionId } = req.params;
    const option = await Option.findById(optionId);
    const user = await User.findById(id);
    const poll = await Poll.findOne({ options: optionId });

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "active") {
      throw appError({ code: 400, message: "投票未開始或是已結束", next });
    }
    if (!option) {
      throw appError({ code: 404, message: "找不到選項", next });
    }
    console.log(option.voters);
    if (!option.voters.find((voter) => voter.user.toString() === id)) {
      throw appError({ code: 400, message: "您尚未對此選項投票", next });
    }
    // 移除投票者
    const resultOption = await Option.findByIdAndUpdate(
      optionId,
      { $pull: { voters: { user } } },
      { new: true }
    )
      .populate("voters.user", "name avatar")
      .exec();

    successHandle(res, "取消投票成功", { resultOption });
  };

  // 新增選項
  public static createOption: RequestHandler = async (req, res, next) => {
    const { pollId, optionData } = req.body;
    const poll = await Poll.findOne({ _id: pollId });

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "pending") {
      throw appError({ code: 400, message: "投票已經開始或是已結束", next });
    }
    const validatorInput = await optionArraySchema.validate(optionData);
    if (!validatorInput) {
      throw appError({ code: 400, message: "請確實填寫選項資訊", next });
    }
    const newOption = await Option.create({ ...validatorInput, pollId });
    successHandle(res, "新增選項成功", { newOption });
  };

  // 更新選項
  public static updateOption: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { updateData } = req.body;
    const poll = await Poll.findOne({ options: id });
    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "pending") {
      throw appError({ code: 400, message: "投票已經開始或是已結束", next });
    }
    const validatorInput = await optionSchema.validate(updateData);
    if (!validatorInput) {
      throw appError({ code: 400, message: "請確實填寫選項資訊", next });
    }
    const updatedOption = await Option.findByIdAndUpdate(id, validatorInput, {
      new: true,
    });
    if (!updatedOption) {
      throw appError({ code: 404, message: "找不到選項", next });
    }
    successHandle(res, "更新選項成功", { updatedOption });
  };

  // 刪除選項
  public static deleteOption: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const poll = await Poll.findOne({ options: id });
    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "pending") {
      throw appError({ code: 400, message: "投票已經開始或是已結束", next });
    }
    const deletedOption = await Option.findByIdAndDelete(id);
    if (!deletedOption) {
      throw appError({ code: 404, message: "找不到選項", next });
    }
    successHandle(res, "刪除選項成功", { deletedOption });
  };
}

export default OptionController;
