import PollController from '@/controllers/poll.controller';

import { handleErrorAsync } from '@/utils';

import { Router } from 'express';

const pollRouter = Router();

pollRouter.get(
  /**
  * #swagger.tags = ['Poll - 提案']
  * #swagger.description = '獲取所有提案'
  * #swagger.path = '/api/poll/'
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
      message: "獲取提案列表成功",
      result: [
        {
          $ref: "#/definitions/Poll"
        },
      ],
    },
    description: "獲取提案列表成功"
  }
  */
  '/',
  handleErrorAsync(PollController.getAllPolls),
);

pollRouter.get(
  /**
   * #swagger.tags = ['Poll - 提案']
   * #swagger.description = '根據 ID 獲取提案詳情'
   * #swagger.path = '/api/poll/{id}'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '提案ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "獲取提案詳細資訊成功",
      result: {
        $ref: "#/definitions/Poll"
      }
    },
    description: "獲取提案詳細資訊成功"
    }
   * #swagger.responses[404] = {
    schema: { $ref: "#/definitions/ErrorPollNotFound" },
    description: "找不到提案"
    }
   */
  '/:id',
  handleErrorAsync(PollController.getPollById),
);

pollRouter.post(
  /**
   * #swagger.tags = ['Poll - 提案']
   * #swagger.description = '創建新提案'
   * #swagger.path = '/api/poll/'
   * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '新提案',
    schema: {
      $ref: "#/definitions/PollCreate"
      },
    }
   * #swagger.responses[200] = {
    schema: {
    status: true,
    message: "提案創建成功",
    result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "提案創建成功"
    }
    * #swagger.responses[400] = {
    schema: {
      $ref: "#/definitions/ErrorPollValidation"
    },
    description: "請確實填寫提案資訊"
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
   * #swagger.tags = ['Poll - 提案']
   * #swagger.description = '更新提案'
   * #swagger.path = '/api/poll/{id}'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '提案ID'
    }
    * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '更新提案',
    schema: {
      $ref: "#/definitions/PollCreate"
      },
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "提案更新成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "提案更新成功"
    }
    * #swagger.responses[400] = {
    schema: {
      $ref: "#/definitions/ErrorPollValidation"
    },
    description: "請確實填寫提案資訊"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    }
  },
    description: "找不到提案"
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
   * #swagger.tags = ['Poll - 提案']
   * #swagger.description = '刪除提案'
   * #swagger.path = '/api/poll/{id}'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '提案ID'
    }
    * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "刪除提案成功"
    },
    description: "刪除提案成功"
    }
    * #swagger.responses[404] = {
    schema: {
      ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到提案"
    }
    * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id',
  handleErrorAsync(PollController.deletePoll),
);

pollRouter.get(
  /**
   * #swagger.tags = ['Poll - 提案']
   * #swagger.description = '提案按讚'
   * #swagger.path = '/api/poll/{id}/like'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '提案ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "提案按讚成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "提案按讚成功"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到提案"
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
   * #swagger.tags = ['Poll - 提案']
   * #swagger.description = '取消提案按讚'
   * #swagger.path = '/api/poll/{id}/like'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '提案ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "取消提案按讚成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "取消提案按讚成功"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到提案"
    }
   * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id/like',
  handleErrorAsync(PollController.unlikePoll),
);

//提案開始
pollRouter.get(
  /**
   * #swagger.tags = ['Poll - 提案']
   * #swagger.description = '提案開始'
   * #swagger.path = '/api/poll/{id}/start'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '提案ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "提案開始成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "提案開始成功"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到提案"
    }
   * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id/start',
  handleErrorAsync(PollController.startPoll),
);

//提案結束
pollRouter.get(
  /**
   * #swagger.tags = ['Poll - 提案']
   * #swagger.description = '提案結束'
   * #swagger.path = '/api/poll/{id}/end'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '提案ID'
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "提案結束成功",
      result: {
      $ref: "#/definitions/Poll"
      }
    },
    description: "提案結束成功"
    }
   * #swagger.responses[404] = {
    schema: {
      $ref: "#/definitions/ErrorPollNotFound"
    },
    description: "找不到提案"
    }
   * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id/end',
  handleErrorAsync(PollController.endPoll),
);

export default pollRouter;
