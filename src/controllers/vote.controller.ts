import { RequestHandler } from "express";
import { appError, successHandle } from "@/utils";
import { IUser } from "@/types";
import { MemberService, PollService, VoteService } from "@/services";
class VoteController {
  // 投票
  public static vote: RequestHandler = async (req, res, next) => {
    const { optionId } = req.body;
    const { id } = req.user as IUser;
    await PollService.checkPollStartVote(optionId, next);
    const vote = await VoteService.getVote(optionId, next);
    const user = await MemberService.getMemberById(id, next);
    if (vote?.voters.some((voter) => voter.user._id.toString() === id)) {
      throw appError({ code: 400, message: "您已經對此選項投過票", next });
    }
    // 添加投票者
    const result = await VoteService.addVote(optionId, user);
    successHandle(res, "投票成功", { result });
  };

  // 更改投票
  public static updateVote: RequestHandler = async (req, res, next) => {
    const { id } = req.user as IUser;
    const { id: voteId } = req.params;
    const { newVoteId } = req.body;

    await PollService.checkPollStartVote(voteId, next);
    const vote = await VoteService.getVote(voteId, next);
    const user = await MemberService.getMemberById(id, next);

    const voter = vote.voters.find((voter) => voter.user._id.toString() === id);
    if (!voter) {
      throw appError({ code: 400, message: "找不到投票者", next });
    }

    const newVote = await VoteService.getVote(voteId, next);
    if (!newVote) {
      throw appError({ code: 404, message: "找不到新投票選項", next });
    }
    const result = await VoteService.updateVote(voteId, newVoteId, user);

    successHandle(res, "更改投票成功", { result });
  };

  // 取消投票
  public static cancelVote: RequestHandler = async (req, res, next) => {
    const { id } = req.user as IUser;
    const { id: voteId } = req.params;

    await PollService.checkPollStartVote(voteId, next);
    const vote = await VoteService.getVote(voteId, next);
    const user = await MemberService.getMemberById(id, next);

    if (!vote.voters.find((voter) => voter.user._id.toString() === id)) {
      throw appError({ code: 400, message: "您尚未對此選項投票", next });
    }
    // 移除投票者
    const result = await VoteService.cancelVote(voteId, user);

    successHandle(res, "取消投票成功", { result });
  };
}

export default VoteController;
