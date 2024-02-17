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
        schema: {
          status: true,
          message: "成功取得使用者列表",
          result: {
              users: {$ref: "#/definitions/Members"},
            totalPages: 1,
            currentPage: 1,
            totalCount: 1,
          },
        },
        description: "獲取會員列表成功"
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
        schema: {
          status: true,
          message: "成功取的使用者資訊",
          result: {
          $ref: "#/definitions/Member"
          }
        },
        description: "獲取會員詳情成功"
      }
    * #swagger.responses[404] = {
        schema: { $ref: "#/definitions/ErrorMemberNotFound" },
        description: "找不到會員"
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
        $ref: "#/definitions/UserProfile",
      },
    }
    * #swagger.responses[200] = {
        schema: {
          status: true,
          message: "成功更新使用者資訊！",
          $ref: "#/definitions/Member"
        },
        description: "更新會員資料成功"
      }
    * #swagger.responses[404] = {
        schema: { $ref: "#/definitions/ErrorUserNotFound" },
        description: "找不到會員"
      }
    * #swagger.responses[401] = {
    schema: {
        $ref: "#/definitions/ErrorTokenExpired"
    },
    description: "Token 已經過期或無效"
  }
  * #swagger.responses[403] = {
    schema: {
      $ref: "#/definitions/ErrorJsonWebToken"
    },
    description: "驗證失敗"
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
      schema: {
        status: true,
        message: "成功刪除使用者",
        result: null,
      },
      description: "刪除會員成功"
    }
  * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/ErrorMemberNotFound" },
      description: "找不到會員"
    }
  * #swagger.responses[401] = {
    schema: {
        $ref: "#/definitions/ErrorTokenExpired"
    },
    description: "Token 已經過期或無效"
  }
  * #swagger.responses[403] = {
    schema: {
      $ref: "#/definitions/ErrorJsonWebToken"
    },
    description: "驗證失敗"
  }
  * #swagger.security = [{
      "Bearer": []
    }]
    */
  '/:id',  handleErrorAsync(MemberController.deleteMemberById));
memberRouter.get(
  /**
   * #swagger.tags = ['Member - 會員']
   * #swagger.description = '加入追蹤'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '會員ID'
  }
  * #swagger.responses[200] = {
      schema: {
      status: true,
        message: "您已成功追蹤",
        result: { $ref: "#/definitions/Member" },
      },
      description: "成功加入會員追蹤中的人"
    }
  * #swagger.responses[400] = {
    schema: { $ref: "#/definitions/ErrorNoneMemberId" },
    description: "沒有提供會員 ID"
  }
  * #swagger.responses[401] = {
    schema: {
        status: false,
        message: "您無法追蹤自己",
    },
    description: "加入追蹤失敗"
  }
  * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/ErrorMemberNotFound" },
      description: "找不到會員"
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
      schema: {
        status: true,
        message: "取消追蹤成功",
        result: { $ref: "#/definitions/Member" },
      },
      description: "取消追蹤成功"
    }
  * #swagger.responses[400] = {
    schema: { $ref: "#/definitions/ErrorNoneMemberId" },
    description: "沒有提供會員 ID"
  }
  * #swagger.responses[401] = {
    schema: {
        status: false,
        message: "您無法取消追蹤自己",
    },
    description: "加入追蹤失敗"
  }
  * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/ErrorMemberNotFound" },
      description: "找不到會員"
    }
  * #swagger.security = [{
      "Bearer": []
    }]
    */
  '/follow/:id',  handleErrorAsync(MemberController.deleteFollower));

export default memberRouter;
