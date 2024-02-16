import OptionController from '@/controllers/option.controller';

import { handleErrorAsync } from '@/utils';

import { Router } from 'express';

const optionRouter = Router();


optionRouter.post(
  /**
   * #swagger.tags = ['Option - 投票及投票選項']
   * #swagger.description = '投票'
    * #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        type: 'object',
        description: '投票',
        schema: {
          properties: {
            optionId: { type: 'string' },
            userId: { type: 'string' },
          },
        },
      }
      * #swagger.responses[200] = {
          schema: { $ref: "#/definitions/Option" },
          description: "投票成功"
        }
      * #swagger.responses[404] = {
          schema: { $ref: "#/definitions/Error" },
          description: "找不到選項"
        }
      * #swagger.responses[500] = {
          schema: { $ref: "#/definitions/Error" },
          description: "投票失敗"
        }
      * #swagger.security = [{
          "Bearer": []
        }]
  */
  '/vote',
  
  handleErrorAsync(OptionController.vote),
);

optionRouter.put(
  /**
   * #swagger.tags = ['Option - 投票及投票選項']
   * #swagger.description = '更改投票'
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '更改投票',
      schema: {
        properties: {
          optionId: { type: 'string' },
          userId: { type: 'string' },
          newOptionId: { type: 'string' },
        },
      },
    }
    * #swagger.responses[200] = {
        schema: { $ref: "#/definitions/Option" },
        description: "更改投票成功"
      }
    * #swagger.responses[404] = {
        schema: { $ref: "#/definitions/Error" },
        description: "找不到選項"
      }
    * #swagger.responses[500] = {
        schema: { $ref: "#/definitions/Error" },
        description: "更改投票失敗"
      }
    * #swagger.security = [{
        "Bearer": []
      }]
   */
  '/vote',
  
  handleErrorAsync(OptionController.updateVote),
);

optionRouter.delete(
  /**
   * #swagger.tags = ['Option - 投票及投票選項']
   * #swagger.description = '取消投票'
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '取消投票',
      schema: {
        properties: {
          optionId: { type: 'string' },
          userId: { type: 'string' },
        },
      },
    }
    * #swagger.responses[200] = {
        schema: { $ref: "#/definitions/Option" },
        description: "取消投票成功"
      }
    * #swagger.responses[404] = {
        schema: { $ref: "#/definitions/Error" },
        description: "找不到選項"
      }
    * #swagger.responses[500] = {
        schema: { $ref: "#/definitions/Error" },
        description: "取消投票失敗"
      }
    * #swagger.security = [{
        "Bearer": []
      }]
   */
  '/vote',
  
  handleErrorAsync(OptionController.cancelVote),
);
optionRouter.post(
  /**
   * #swagger.tags = ['Option - 投票及投票選項']
   * #swagger.description = '新增選項'
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '新增選項',
      schema: {
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          imageUrl: { type: 'string' },
          pollId: { type: 'string' },
        },
      },
    }
    * #swagger.responses[200] = {
        schema: { $ref: "#/definitions/Option" },
        description: "新增選項成功"
      }
    * #swagger.responses[500] = {
        schema: { $ref: "#/definitions/Error" },
        description: "新增選項失敗"
      }
    * #swagger.security = [{
        "Bearer": []
      }]
   */
  '/',
  
  handleErrorAsync(OptionController.createOption),
);
optionRouter.put(
  /**
   * #swagger.tags = ['Option - 投票及投票選項']
   * #swagger.description = '更新選項'
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '更新選項',
      schema: {
        properties: {
          optionId: { type: 'string' },
          updateData: { type: 'object' },
        },
      },
    }
    * #swagger.responses[200] = {
        schema: { $ref: "#/definitions/Option" },
        description: "更新選項成功"
      }
    * #swagger.responses[404] = {
        schema: { $ref: "#/definitions/Error" },
        description: "找不到選項"
      }
    * #swagger.responses[500] = {
        schema: { $ref: "#/definitions/Error" },
        description: "更新選項失敗"
      }
    * #swagger.security = [{
        "Bearer": []
      }]
   */
  '/',
  
  handleErrorAsync(OptionController.updateOption),
);

optionRouter.delete(
  /**
   * #swagger.tags = ['Option - 投票及投票選項']
   * #swagger.description = '刪除選項'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '選項ID'
  }
  * #swagger.responses[200] = {
    schema: { $ref: "#/definitions/Option" },
    description: "刪除選項成功"
  }
  * #swagger.responses[404] = {
    schema: { $ref: "#/definitions/Error" },
    description: "找不到選項"
  }
  * #swagger.responses[500] = {
    schema: { $ref: "#/definitions/Error" },
    description: "刪除選項失敗"
  }
  * #swagger.security = [{
    "Bearer": []
  }]
  */
  '/:id',
  
  handleErrorAsync(OptionController.deleteOption),
);

export default optionRouter;
