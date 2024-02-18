import { PollController } from "@/controllers";
import { Poll } from "@/models";
import { Logger } from "@/utils";

import cron from 'node-cron';

export class PollService
{
  static startPollCheckService = () =>
  {
    cron.schedule('* * * * *', async () =>
    {
      Logger.log('Checking polls...', 'INFO');
      const now = new Date();

      const pollsToActivate = await Poll.find({ startDate: { $lte: now }, status: 'pending' });
      pollsToActivate.forEach(async (poll) => {
        poll.status = 'active';
        await poll.save();
      });

      Logger.log(`目前有 ${ pollsToActivate.length } 筆投票正在進行中`, 'INFO');

      const pollsToEnd = await Poll.find({ endDate: { $lte: now }, status: 'active' });

      Logger.log(`目前有 ${ pollsToEnd.length } 筆投票已經結束`, 'INFO');

      for (let poll of pollsToEnd) {
        await PollController.calculateResultsForPoll(poll._id);
      }

    });
  }
}
