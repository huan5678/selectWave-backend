import { RequestHandler } from "express";
import { Poll, Vote, User } from "@/models";
import { appError, successHandle } from "@/utils";
import { IUser } from "@/types";
class VoteController {
  // 投票
  public static vote: RequestHandler = async (req, res, next) => {
    const { optionId } = req.body;
    const { id } = req.user as IUser;
    const poll = await Poll.findOne({ options: optionId });
    const vote = await Vote.findById(optionId);
    const user = await User.findOne({ _id: id });

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "active") {
      throw appError({ code: 400, message: "投票未開始或是已結束", next });
    }
    // 檢查是否已經投過票
    if (!vote) {
      throw appError({ code: 404, message: "找不到選項", next });
    }
    if (vote?.voters.some((voter) => voter.user.toString() === id)) {
      throw appError({ code: 400, message: "您已經對此選項投過票", next });
    }

    // 添加投票者
    const updatedVote = await Vote.findByIdAndUpdate(
      { _id: optionId },
      { $push: { voters: { user, createdTime: new Date() } } },
      { new: true }
    )
      .populate("voters.user", "name avatar")
      .exec();

    successHandle(res, "投票成功", { updatedVote });
  };

  // 更改投票
  public static updateVote: RequestHandler = async (req, res, next) => {
    const { id } = req.user as IUser;
    const { id: voteId } = req.params;
    const { newVoteId } = req.body;

    const vote = await Vote.findById(voteId);
    const user = await User.findOne({ _id: id });
    const poll = await Poll.findOne({ votes: voteId });

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "active") {
      throw appError({ code: 400, message: "投票未開始或是已結束", next });
    }
    // 檢查是否已經投過票
    if (!vote) {
      throw appError({ code: 404, message: "找不到選項", next });
    }
    const voter = vote.voters.find((voter) => voter.user.toString() === id);
    if (!voter) {
      throw appError({ code: 400, message: "找不到投票者", next });
    }

    vote.voters = vote.voters.filter(
      (voter) => voter.user.toString() !== id
    );

    const newVote = await Vote.findById(newVoteId);
    if (!newVote) {
      throw appError({ code: 404, message: "找不到新投票選項", next });
    }
    const updatedNewVote = await Vote.findByIdAndUpdate(
      newVoteId,
      { $push: { voters: { user, createdTime: new Date() } } },
      { new: true }
    )
      .populate("voters.user", "name avatar")
      .exec();
    await vote.save();

    successHandle(res, "更改投票成功", { updatedNewVote });
  };

  // 取消投票
  public static cancelVote: RequestHandler = async (req, res, next) => {
    const { id } = req.user as IUser;
    const { id: voteId } = req.params;
    const vote = await Vote.findById(voteId);
    const user = await User.findById(id);
    const poll = await Poll.findOne({ votes: voteId });

    if (!poll) {
      throw appError({ code: 404, message: "找不到投票", next });
    }
    if (poll.status !== "active") {
      throw appError({ code: 400, message: "投票未開始或是已結束", next });
    }
    if (!vote) {
      throw appError({ code: 404, message: "找不到選項", next });
    }
    if (!vote.voters.find((voter) => voter.user.toString() === id)) {
      throw appError({ code: 400, message: "您尚未對此選項投票", next });
    }
    // 移除投票者
    const resultVote = await Vote.findByIdAndUpdate(
      voteId,
      { $pull: { voters: { user } } },
      { new: true }
    )
      .populate("voters.user", "name avatar")
      .exec();

    successHandle(res, "取消投票成功", { resultVote });
  };
}

export default VoteController;
