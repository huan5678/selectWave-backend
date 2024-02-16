import MemberController from '@/controllers/member.controller';

import { handleErrorAsync } from '@/utils';
import { Router } from 'express';

const memberRouter = Router();

memberRouter.get(
  /**
   * #swagger.tags = ['Member - 會員']
   * #swagger.description = '獲取所有會員'
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
        schema: { $ref: "#/definitions/Member" },
        description: "獲取會員列表成功"
      }
    * #swagger.responses[500] = {
        schema: { $ref: "#/definitions/Error" },
        description: "獲取會員列表失敗"
      }
   */
  '/', handleErrorAsync(MemberController.getAllMembers));
memberRouter.get(
  /**
   * #swagger.tags = ['Member - 會員']
   * #swagger.description = '根據 ID 獲取會員詳情'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '會員ID'
    }
    * #swagger.responses[200] = {
        schema: { $ref: "#/definitions/Member" },
        description: "獲取會員詳情成功"
      }
    * #swagger.responses[404] = {
        schema: { $ref: "#/definitions/Error" },
        description: "找不到會員"
      }
    * #swagger.responses[500] = {
        schema: { $ref: "#/definitions/Error" },
        description: "獲取會員詳情失敗"
      }
   */
  '/:id', handleErrorAsync(MemberController.getMemberById));
memberRouter.put(
  /**
   * #swagger.tags = ['Member - 會員']
   * #swagger.description = '更新會員資料'
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '更新會員資料',
      schema: {
        properties: {
          id: { type: 'string' },
          updateData: { type: 'object' },
        },
      },
    }
    * #swagger.responses[200] = {
        schema: { $ref: "#/definitions/Member" },
        description: "更新會員資料成功"
      }
    * #swagger.responses[404] = {
        schema: { $ref: "#/definitions/Error" },
        description: "找不到會員"
      }
    * #swagger.responses[500] = {
        schema: { $ref: "#/definitions/Error" },
        description: "更新會員資料失敗"
      }
    * #swagger.security = [{
        "Bearer": []
      }]
   */
  '/',  handleErrorAsync(MemberController.updateProfile));
memberRouter.delete(
  /**
   * #swagger.tags = ['Member - 會員']
   * #swagger.description = '刪除會員'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '會員ID'
  }
  * #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Member" },
      description: "刪除會員成功"
    }
  * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/Error" },
      description: "找不到會員"
    }
  * #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: "刪除會員失敗"
    }
  * #swagger.security = [{
      "Bearer": []
    }]
    */
  '/:id',  handleErrorAsync(MemberController.deleteMemberById));
memberRouter.get(
  /**
   * #swagger.tags = ['Member - 會員']
   * #swagger.description = '獲取會員追蹤者'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '會員ID'
  }
  * #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Member" },
      description: "獲取會員追蹤者成功"
    }
  * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/Error" },
      description: "找不到會員"
    }
  * #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: "獲取會員追蹤者失敗"
    }
  * #swagger.security = [{
      "Bearer": []
    }]
    */
  '/follow',  handleErrorAsync(MemberController.getFollowers));
memberRouter.get(
  /**
   * #swagger.tags = ['Member - 會員']
   * #swagger.description = '獲取會員追蹤中的人'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '會員ID'
  }
  * #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Member" },
      description: "獲取會員追蹤中的人成功"
    }
  * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/Error" },
      description: "找不到會員"
    }
  * #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: "獲取會員追蹤中的人失敗"
    }
  * #swagger.security = [{
      "Bearer": []
    }]
    */
  '/follow/:id',  handleErrorAsync(MemberController.addFollower));
memberRouter.delete(
  /**
   * #swagger.tags = ['Member - 會員']
   * #swagger.description = '取消追蹤'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '會員ID'
  }
  * #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Member" },
      description: "取消追蹤成功"
    }
  * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/Error" },
      description: "找不到會員"
    }
  * #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: "取消追蹤失敗"
    }
  * #swagger.security = [{
      "Bearer": []
    }]
    */
  '/follow/:id',  handleErrorAsync(MemberController.deleteFollower));

export default memberRouter;
