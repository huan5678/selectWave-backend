import ContactController from '@/controllers/contact.controller';

import { handleErrorAsync } from '@/utils';

import { Router } from 'express';

const contactRouter = Router();

contactRouter.post(
  /**
   * #swagger.tags = ['Contact - 聯絡我們與訂閱電子報']
   * #swagger.description = '接收聯絡我們表單'
   * #swagger.path = '/api/contact/'
    #swagger.parameters['contact'] = {
    in: 'body',
    description: 'Contact us',
    required: true,
    schema: { $ref: "#/definitions/Contact" }
    }
    * #swagger.responses[200] = {
    schema: {
        status: true,
        message: "感謝您的留言",
      },
    }
    * #swagger.responses[400] = {
    schema: { $ref: "#/definitions/ErrorContactFormat" },
    }
   */
  '/', handleErrorAsync(ContactController.create));

contactRouter.post(
  /**
   * #swagger.tags = ['Contact - 聯絡我們與訂閱電子報']
   * #swagger.description = '訂閱電子報'
   * #swagger.path = '/api/contact/subscribe'
   * #swagger.parameters['email'] = {
    in: 'body',
    description: 'Email',
    required: true,
    schema: {
    email: "example@example.com"
    }
  }
  * #swagger.responses[200] = {
    schema: {
        status: true,
        message: "感謝您的訂閱",
      },
    }
    * #swagger.responses[400] = {
    schema: {
      status: false,
      message: "您已經訂閱過了"
    },
    }
    * #swagger.responses[400] = {
    schema: {
      status: false,
      message: "請輸入正確的Email格式"
    },
    }
   */
  '/subscribe', handleErrorAsync(ContactController.subscribe));

contactRouter.put(
  /**
   * #swagger.tags = ['Contact - 聯絡我們與訂閱電子報']
   * #swagger.description = '退訂電子報'
   * #swagger.path = '/api/contact/subscribe/'
   * #swagger.parameters['email'] = {
    in: 'body',
    description: 'Email',
    required: true,
    schema: {
    token: "eyJhbGciOiJIUzI1NiJ9.dGxxxxxx"
    }
  }
  * #swagger.responses[200] = {
    schema: {
        status: true,
        message: "退訂成功，期待您再次訂閱電子報",
      },
    }
    * #swagger.responses[400] = {
    schema: {
      status: false,
      message: "您尚未訂閱過"
    },
    }
    * #swagger.responses[403] = {
    schema: {
      status: false,
      message: "驗證失敗請確認是否有權限取消訂閱"
    },
    }
   */
  '/subscribe', handleErrorAsync(ContactController.unsubscribe));

export default contactRouter;