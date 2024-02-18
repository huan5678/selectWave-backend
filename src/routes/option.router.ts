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
          optionId: '60f3e3e3e3e3e3e3e3e3e3e3',
        },
      }
      * #swagger.responses[200] = {
          schema: {
          status: true,
          message: "投票成功",
          result: {
            $ref: "#/definitions/Option" },
          },
          description: "投票成功"
        }
      * #swagger.responses[404] = {
          schema: {
            $ref: "#/definitions/ErrorOptionNotFound"
          },
          description: "找不到選項"
        }
      * #swagger.responses[400] = {
          schema: {
            $ref: "#/definitions/ErrorVoteExist"
          },
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
          optionId: '60f3e3e3e3e3e3e3e3e3e3e3',
          newOptionId: '54f3e3e3e3e3e3e3e3e3e3e3',
      },
    }
    * #swagger.responses[200] = {
        schema: {
          status: true,
          message: "更改投票成功",
          result: {
          $ref: "#/definitions/Option" },
        },
        description: "更改投票成功"
      }
    * #swagger.responses[404] = {
        schema: { $ref: "#/definitions/ErrorOptionNotFound" },
        description: "找不到選項"
      }
    * #swagger.responses[400] = {
          schema: {
            $ref: "#/definitions/ErrorVoteExist"
          },
          description: "投票失敗"
        }
    * #swagger.responses[400] = {
        schema: {
          status: false,
          message: "找不到投票者"
        },
        description: "找不到新投票選項"
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
        schema: {
          status: true,
          message: "取消投票成功",
        },
        description: "取消投票成功"
      }
    * #swagger.responses[404] = {
        schema: {
          $ref: "#/definitions/ErrorOptionNotFound"
        },
        description: "找不到選項"
      }
    * #swagger.responses[400] = {
        schema: { $ref: "#/definitions/ErrorNotVote" },
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
        pollId: '60f3e3e3e3e3e3e3e3e3e3e3',
        optionData: [
          {
          title: 'React',
          imageUrl: 'https://imgur.com/TECsq2J.png',
          }
        ],
      },
    }
    * #swagger.responses[200] = {
        schema: {
          status: true,
          message: "新增選項成功",
          result: {
          $ref: "#/definitions/Option"
          },
        },
        description: "新增選項成功"
      }
    * #swagger.responses[400] = {
        schema: { $ref: "#/definitions/ErrorOptionFormat" },
        description: "請確實填寫選項資訊"
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
        optionId: '60f3e3e3e3e3e3e3e3e3e3e3',
        updateData: {
        title: 'Vue',
        imageUrl: 'https://imgur.com/TECsq2J.png',
        },
      },
    }
    * #swagger.responses[200] = {
        schema: {
          status: true,
          message: "更新選項成功",
          result: {
          $ref: "#/definitions/Option"
          },
        },
        description: "更新選項成功"
      }
    * #swagger.responses[404] = {
        schema: { $ref: "#/definitions/ErrorOptionNotFound" },
        description: "找不到選項"
      }
    * #swagger.responses[400] = {
        schema: { $ref: "#/definitions/ErrorOptionFormat" },
        description: "請確實填寫選項資訊"
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
    schema: { $ref: "#/definitions/ErrorOptionNotFound" },
    description: "找不到選項"
  }
  * #swagger.security = [{
    "Bearer": []
  }]
  */
  '/:id',
  handleErrorAsync(OptionController.deleteOption),
);

export default optionRouter;
