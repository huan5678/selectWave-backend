import PollController from '@/controllers/poll.controller';

import { handleErrorAsync } from '@/utils';

import { Router } from 'express';

const pollRouter = Router();

pollRouter.get(
  /**
  * #swagger.tags = ['Poll - 投票']
  * #swagger.description = '獲取所有投票'
  * #swagger.parameters['page'] = {
    in: 'query',
    required: false,
    type: 'number',
    description: '頁碼',
  }
  * #swagger.parameters['limit'] = {
    in: 'query',
    required: false,
    type: 'number',
    description: '每頁記錄數',
  }
  * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "獲取投票列表成功",
      result: {
        $ref: "#/definitions/Poll"
      },
    },
    description: "獲取投票列表成功"
  }
  */
  '/',
  handleErrorAsync(PollController.getAllPolls),
);

pollRouter.get(
  /**
   * #swagger.tags = ['Poll - 投票']
   * #swagger.description = '根據 ID 獲取投票詳情'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '投票ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "獲取投票詳細資訊成功",
      result: {
        $ref: "#/definitions/Poll"
      }
    },
    description: "獲取投票詳細資訊成功"
    }
   * #swagger.responses[404] = {
    schema: { $ref: "#/definitions/ErrorPollNotFound" },
    description: "找不到投票"
    }
   */
  '/:id',
  handleErrorAsync(PollController.getPollById),
);

pollRouter.post(
  /**
   * #swagger.tags = ['Poll - 投票']
   * #swagger.description = '創建新投票'
   * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '新投票',
    schema: {
      $ref: "#/definitions/PollCreate"
      },
    }
   * #swagger.responses[200] = {
    schema: {
    status: true,
    message: "投票創建成功",
    result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "投票創建成功"
    }
    * #swagger.responses[400] = {
    schema: {
      $ref: "#/definitions/ErrorPollValidation"
    },
    description: "請確實填寫投票資訊"
    }
   * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/',
  handleErrorAsync(PollController.createPoll),
);

pollRouter.put(
  /**
   * #swagger.tags = ['Poll - 投票']
   * #swagger.description = '更新投票'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '投票ID'
    }
    * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '更新投票',
    schema: {
      $ref: "#/definitions/PollUpdate"
    },
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "投票更新成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "投票更新成功"
    }
    * #swagger.responses[400] = {
    schema: {
      $ref: "#/definitions/ErrorPollValidation"
    },
    description: "請確實填寫投票資訊"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    }
  },
    description: "找不到投票"
    }
   * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id',
    handleErrorAsync(PollController.updatePoll),
  );

pollRouter.delete(
  /**
   * #swagger.tags = ['Poll - 投票']
   * #swagger.description = '刪除投票'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '投票ID'
    }
    * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "刪除投票成功"
    },
    description: "刪除投票成功"
    }
    * #swagger.responses[404] = {
    schema: {
      ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到投票"
    }
    * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id',
  handleErrorAsync(PollController.deletePoll),
);

pollRouter.post(
  /**
   * #swagger.tags = ['Poll - 投票']
   * #swagger.description = '投票按讚'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '投票ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "投票按讚成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "投票按讚成功"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到投票"
    }
   * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id/like',
  handleErrorAsync(PollController.likePoll),
);

pollRouter.delete(
  /**
   * #swagger.tags = ['Poll - 投票']
   * #swagger.description = '取消投票按讚'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '投票ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "取消投票按讚成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "取消投票按讚成功"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到投票"
    }
   * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id/unlike',
  handleErrorAsync(PollController.unlikePoll),
);

//投票開始
pollRouter.get(
  /**
   * #swagger.tags = ['Poll - 投票']
   * #swagger.description = '投票開始'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '投票ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "投票開始成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "投票開始成功"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到投票"
    }
   * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id/start',
  handleErrorAsync(PollController.startPoll),
);

//投票結束
pollRouter.get(
  /**
   * #swagger.tags = ['Poll - 投票']
   * #swagger.description = '投票結束'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '投票ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "投票結束成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "投票結束成功"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到投票"
    }
   * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id/end',
  handleErrorAsync(PollController.endPoll),
);

export default pollRouter;
