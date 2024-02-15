import { Router } from 'express';
import { AuthController, MailServiceController, ThirdPartyAuthController } from '@/controllers';
import { handleErrorAsync } from '@/utils';
import { isAuthor } from '@/middleware';

const authRouter = Router();

authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '註冊'
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '註冊',
      schema: {
          email: 'example@example.com',
          password: 'Abc@12345',
          confirmPassword: 'Abc@12345',
      },
    }
    * #swagger.responses[200] = {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            result: {
              type: 'object',
              properties: {
                authToken: { type: 'string' },
              },
            },
          },
        },
        description: "註冊成功"
      }
    * #swagger.responses[400] = {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            result: {
              type: 'object',
              properties: {
                authToken: { type: 'string' },
              },
            },
          },
        },
        description: "註冊失敗"
      }
  */
  '/register', handleErrorAsync(AuthController.registerHandler));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '登入'
   * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '登入',
      schema: {
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    }
    * #swagger.responses[200] = {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            result: {
              type: 'object',
              properties: {
                authToken: { type: 'string' },
                member: { $ref: "#/definitions/User" },
              },
            },
          },
        },
        description: "登入成功"
      }
    * #swagger.responses[400] = {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        description: "登入失敗"
      }
    * #swagger.responses[401] = {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        description: "帳號或密碼錯誤"
      }
    * #swagger.responses[500] = {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        description: "登入失敗"
      }
   */
  '/login', handleErrorAsync(AuthController.loginHandler));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '登出'
   * #swagger.responses[200] = {
    schema: { $ref: "#/definitions/Success" },
    description: "登出成功"
  }
  * #swagger.responses[500] = {
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    description: "登出失敗"
  }
  * #swagger.security = [{ "Bearer": [] }]
   */
  '/logout', isAuthor, handleErrorAsync(AuthController.logoutHandler));
authRouter.get(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '解碼 token'
   * #swagger.responses[200] = {
    schema: { $ref: "#/definitions/Success" },
    description: "解碼成功"
    }
  * #swagger.responses[500] = {
    schema: { $ref: "#/definitions/Error" },
    description: "解碼失敗"
  }
  * #swagger.security = [{ "Bearer": [] }]
   */
  '/user-info', isAuthor, handleErrorAsync(AuthController.decodeTokenHandler));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '重設密碼'
   * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '重設密碼',
    schema: {
      properties: {
        email: { type: 'string' },
      },
    },
  }
  * #swagger.responses[200] = {
    schema: { $ref: "#/definitions/Success" },
    description: "重設密碼成功"
  }
  * #swagger.responses[400] = {
    schema: { $ref: "#/definitions/Error" },
    description: "重設密碼失敗"
  }
  * #swagger.responses[500] = {
    schema: { $ref: "#/definitions/Error" },
    description: "重設密碼失敗"
  }
   */
  '/reset-password', handleErrorAsync(AuthController.resetPasswordHandler));
authRouter.get(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '驗證帳號'
   * #swagger.parameters['query'] = {
    token: { type: 'string' }
  }
  * #swagger.responses[200] = {
    schema: { $ref: "#/definitions/Success" },
    description: "使用者成功驗證"
  }
  * #swagger.responses[400] = {
    schema: { $ref: "#/definitions/Error" },
    description: "驗證帳號失敗"
  }
  * #swagger.responses[500] = {
    schema: { $ref: "#/definitions/Error" },
    description: "驗證帳號失敗"
  }
   */
  '/verify', handleErrorAsync(AuthController.verifyAccount));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '重新發送驗證 Email'
   * #swagger.parameters['body'] = {
    email: { type: 'string' }
  }
  * #swagger.responses[200] = {
    schema: { $ref: "#/definitions/Success" },
    description: "重新發送驗證 Email 成功"
  }
  * #swagger.responses[400] = {
    schema: { $ref: "#/definitions/Error" },
    description: "重新發送驗證 Email 失敗"
  }
  * #swagger.responses[500] = {
    schema: { $ref: "#/definitions/Error" },
    description: "重新發送驗證 Email 失敗"
  }
   */
  '/re-verify-email', handleErrorAsync(MailServiceController.resendVerificationEmail));


authRouter.get(
  /**
   * #swagger.ignore = true
   */
  '/google', handleErrorAsync(ThirdPartyAuthController.loginWithGoogle));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/google/callback', handleErrorAsync(ThirdPartyAuthController.googleCallback));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/facebook', handleErrorAsync(ThirdPartyAuthController.loginWithFacebook));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/facebook/callback', handleErrorAsync(ThirdPartyAuthController.facebookCallback));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/line', handleErrorAsync(ThirdPartyAuthController.loginWithLine));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/line/callback', handleErrorAsync(ThirdPartyAuthController.lineCallback));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/discord', handleErrorAsync(ThirdPartyAuthController.loginWithDiscord));
authRouter.get(
    /**
   * #swagger.ignore = true
   */
  '/discord/callback', handleErrorAsync(ThirdPartyAuthController.discordCallback));

export default authRouter;
