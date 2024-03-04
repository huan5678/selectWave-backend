import { Router } from 'express';

import VoteController from '@/controllers/vote.controller';
import { handleErrorAsync } from '@/utils';

const voteRouter = Router();

voteRouter.post(
  /**
   * #swagger.tags = ['Vote - 投票']
   * #swagger.description = '投票'
   * #swagger.path = '/api/vote'
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
  '/',
  handleErrorAsync(VoteController.vote),
);

voteRouter.put(
  /**
   * #swagger.tags = ['Vote - 投票']
   * #swagger.description = '更改投票'
   * #swagger.path = '/api/vote/{id}'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '選項ID'
    }
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '更改投票',
      schema: {
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
  '/:id',
  handleErrorAsync(VoteController.updateVote),
);

voteRouter.delete(
  /**
   * #swagger.tags = ['Vote - 投票']
   * #swagger.description = '取消投票'
   * #swagger.path = '/api/vote/{id}'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '選項ID'
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
  '/:id',
  handleErrorAsync(VoteController.cancelVote),
);

export default voteRouter;
