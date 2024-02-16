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
    schema: { $ref: "#/definitions/Poll" },
    description: "獲取投票列表成功"
  }
  * #swagger.responses[500] = {
    schema: { type: "object",
    properties: {
    message: { type: "string" }
    }
  },
    description: "獲取投票列表失敗"
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
    schema: { $ref: "#/definitions/Poll" },
    description: "獲取投票詳細資訊成功"
    }
   * #swagger.responses[404] = {
    schema: { type: "object",
    properties: {
    message: { type: "string" }
    } },
    description: "找不到投票"
    }
   * #swagger.responses[500] = {
    schema: { type: "object",
    properties: {
    message: { type: "string" }
    }
  },
    description: "獲取投票詳細資訊失敗"
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
    description: '新增投票',
    schema: {
    properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    imageUrl: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    userId: { type: 'string' },
    optionsData: {
    type: 'array',
    items: {
    properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    imageUrl: { type: 'string' },
    },
      },
    }
    },
    },
    }
   * #swagger.responses[200] = {
    schema: { $ref: "#/definitions/Poll" },
    description: "投票創建成功"
    }
   * #swagger.responses[500] = {
    schema: { type: "object",
    properties: {
    message: { type: "string" }
    }
  },
    description: "投票創建失敗"
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
    #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '更新投票',
    schema: {
    properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    imageUrl: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    userId: { type: 'string' },
    optionsData: {
    type: 'array',
    items: {
    properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    imageUrl: { type: 'string' },
    },
      },
    }
    },
    },
    }
   * #swagger.responses[200] = {
    schema: { $ref: "#/definitions/Poll" },
    description: "投票更新成功"
    }
   * #swagger.responses[404] = {
    schema: { type: "object",
    properties: {
    message: { type: "string" }
    }
  },
    description: "找不到投票"
    }
   * #swagger.responses[500] = {
    schema: { type: "object",
    properties: {
    message: { type: "string" }
    }
  },
    description: "投票更新失敗"
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
    type: "object",
    properties: {
    message: { type: "string" }
    }
    },
    description: "刪除投票成功"
    }
    * #swagger.responses[404] = {
    schema: {
    type: "object",
    properties: {
    message: { type: "string" }
    }
    },
    description: "找不到投票"
    }
    * #swagger.responses[500] = {
    schema: { type: "object",
    properties: {
    message: { type: "string" }
    }
  },
    description: "刪除投票失敗"
    }
    * #swagger.security = [{
    "Bearer": []
    }]
   */
  '/:id',
  
  handleErrorAsync(PollController.deletePoll),
);

export default pollRouter;
