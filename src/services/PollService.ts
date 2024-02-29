import PollController from "@/controllers/poll.controller";
import { Poll } from "@/models";
import { Logger } from "@/utils";

export class PollService
{
  static startPollCheckService = async () =>
  {

      Logger.log('Checking polls...', 'INFO');
      const now = new Date();

      await Poll.find({ startDate: { $lte: now }, status: 'pending' }).where('status', 'active').updateMany({ status: 'active' });

      const totalPollsActivated = await Poll.countDocuments({ status: 'active' });

      Logger.log(`目前有 ${totalPollsActivated} 筆投票正在進行中`, 'INFO');


      await Poll.find({ endDate: { $lte: now }, status: 'active' }).where('status', 'ended').updateMany({ status: 'ended' });

      const pollsToEnd = await Poll.find({ endDate: { $lte: now }, status: 'ended' });

      for (let poll of pollsToEnd) {
        await PollController.calculateResultsForPoll(poll._id.toString());
      }
      const totalPollsToEnd = await Poll.countDocuments({ status: 'closed' });

      Logger.log(`目前有 ${ totalPollsToEnd } 筆投票已經結束`, 'INFO');

  }
}

export default PollService;
