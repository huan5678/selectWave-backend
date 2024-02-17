import { Router } from 'express';
import { AuthController, MailServiceController, ThirdPartyAuthController } from '@/controllers';
import { handleErrorAsync } from '@/utils';

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
          status: true,
          message: '註冊成功',
          result: {
            token: 'eyJhbGciOi.....',
          },
        },
        description: "註冊成功",
      }
    * #swagger.responses[400] = {
        schema: {
            message: '此 Email 已註冊',
            status: false,
          },
        },
        description: "註冊失敗"
      }
    * #swagger.responses[400] = {
        schema: {
            message: '密碼不一致',
            status: false,
          },
        },
        description: "註冊失敗"
      }
    * #swagger.responses[400] = {
        schema: {
            message: '請確認輸入的欄位格式是否正確',
            status: false,
          },
        },
        description: "註冊失敗"
      }
    * #swagger.responses[400] = {
        schema: {
            message: '密碼強度不足，請確認是否具至少有 1 個數字， 1 個大寫英文， 1 個小寫英文， 1 個特殊符號，且長度至少為 8 個字元',
            status: false,
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
authRouter.get(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '登出'
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '登出成功',
      result: true,
    },
    description: "登出成功"
  }
  * #swagger.responses[400] = {
    schema: {
      status: false,
      message: '缺少 token',
    },
    description: "登出失敗"
  }
  * #swagger.responses[400] = {
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    description: "登出失敗"
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
  '/logout', handleErrorAsync(AuthController.logoutHandler));
authRouter.get(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '由 Token 取得使用者資訊'
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '驗證成功取得使用者資訊',
      result: { $ref: "#/definitions/User" },
    },
    description: "取得使用者資訊"
    }
  * #swagger.responses[401] = {
    schema: {
        status: false,
        message: 'Token 已經過期或無效',
    },
    description: "Token 已經過期或無效"
  }
  * #swagger.responses[401] = {
    schema: {
      status: false,
      message: '驗證失敗，請重新登入！',
    },
    description: "token 驗證失敗"
  }
  * #swagger.responses[401] = {
    schema: {
      status: false,
      message: '驗證碼已過期，請重新登入！',
    },
    description: "token 驗證失敗"
  }
  * #swagger.responses[403] = {
    schema: {
      status: false,
      message: '請重新登入',
    },
    description: "取得使用者資訊失敗"
  }
  * #swagger.responses[404] = {
    schema: {
      status: false,
      message: '已無此使用者請重新註冊',
    },
    description: "取得使用者資訊失敗"
  }
  * #swagger.security = [{ "Bearer": [] }]
   */
  '/check', handleErrorAsync(AuthController.decodeTokenHandler));
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
      email: 'example@example.com',
    },
  }
  * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '成功送出重設密碼信件，請收信並進行重設步驟',
    },
    description: "成功送出重設密碼信件"
  }
  * #swagger.responses[404] = {
    schema: {
      status: false,
      message: '此 Email 未註冊',
    },
    description: "重設密碼失敗"
  }
  * #swagger.responses[400] = {
    schema: {
      status: false,
      message: 'Email 格式有誤，請確認輸入是否正確',
    },
    description: "重設密碼失敗"
  }
   */
  '/reset-password', handleErrorAsync(AuthController.resetPasswordHandler));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '更新帳號密碼'
   * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '更新帳號密碼',
    schema: {
        email: 'example@example.com',
        password: 'Abc@12345',
        confirmPassword: 'Abc@12345',
      },
    },
   * #swagger.responses[200] = {
      schema: {
        status: true,
        message: '成功更新密碼',
      },
      description: "成功更新密碼"
    }
    * #swagger.responses[400] = {
      schema: {
        status: false,
        message: '密碼不一致',
      },
      description: "更新密碼失敗"
    }
    * #swagger.responses[401] = {
    schema: {
        status: false,
        message: 'Token 已經過期或無效',
    },
    description: "Token 已經過期或無效"
  }
  * #swagger.responses[401] = {
    schema: {
      status: false,
      message: '驗證失敗，請重新登入！',
    },
    description: "token 驗證失敗"
  }
  * #swagger.responses[401] = {
    schema: {
      status: false,
      message: '驗證碼已過期，請重新登入！',
    },
    description: "token 驗證失敗"
  }
  * #swagger.responses[403] = {
    schema: {
      status: false,
      message: '請重新登入',
    },
    description: "更新密碼失敗"
  }
  * #swagger.responses[404] = {
    schema: {
      status: false,
      message: '已無此使用者請重新註冊',
    },
    description: "更新密碼失敗"
  }
  * #swagger.security = [{ "Bearer": [] }]
   */
  '/change-password', handleErrorAsync(AuthController.changePasswordHandler));
authRouter.put(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '重設密碼'
   * #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    type: 'object',
    description: '重設密碼',
    schema: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjY',
      password: 'Abc@12345',
      confirmPassword: 'Abc@12345',
    },
  }
  * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '成功重設密碼',
    },
    description: "成功重設密碼"
  }
  * #swagger.responses[400] = {
    schema: {
      status: false,
      message: '密碼不一致',
    },
    description: "重設密碼失敗"
  }
  * #swagger.responses[400] = {
    schema: {
      status: false,
      message: '缺少 token',
    },
    description: "重設密碼失敗"
  }
  * #swagger.responses[400] = {
    schema: {
      status: false,
      message: '無效的 token',
    },
    description: "重設密碼失敗"
  }
  * #swagger.responses[404] = {
    schema: {
      status: false,
      message: '無效的重設連結或已過期',
    },
    description: "重設密碼失敗"
  }
   */
  '/reset-password', handleErrorAsync(AuthController.verifyResetPasswordHandler));
authRouter.get(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '驗證帳號'
   * #swagger.parameters['parameterName'] = {
    in: 'query',
    type: 'string',
    required: true,
    description: '驗證碼',
    schema: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjY'
  }
  * #swagger.responses[200] = {
    schema: {
    status: true,
      message: '驗證成功',
      result: {
        $ref: "#/definitions/User"
      }
    },
    description: "使用者成功驗證"
  }
  * #swagger.responses[400] = {
    schema: {
      status: false,
      message: '缺少 token',
    },
    description: "驗證帳號失敗"
  }
  * #swagger.responses[400] = {
    schema: {
      status: false,
      message: '無效的 token',
    },
    description: "驗證帳號失敗"
  }
  * #swagger.responses[404] = {
    schema: {
      status: false,
      message: '無效的驗證連結或已過期',
    },
    description: "驗證帳號失敗"
  }
  * #swagger.responses[500] = {
    schema: {
      status: false,
      message: '驗證失敗',
    },
    description: "驗證帳號失敗"
  }
   */
  '/verify', handleErrorAsync(AuthController.verifyAccount));
authRouter.post(
  /**
   * #swagger.tags = ['Auth - 認證']
   * #swagger.description = '重新發送驗證 Email'
   * #swagger.parameters['body'] = {
      email: 'example@example.com',
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: '驗證信已寄出',
      result: '以成功寄送重新驗證信件至 Email: example@example.com',
    },
    description: '重新發送驗證 Email 成功',
  }
  * #swagger.responses[400] = {
    schema: {
      status: false,
      message: '無此帳號，請再次確認註冊 Email 帳號，或是重新註冊新帳號',
    },
    description: "重新發送驗證 Email 失敗"
  }
  * #swagger.responses[400] = {
    schema: {
      status: false,
      message: '信件格式錯誤',
    },
    description: "重新發送驗證 Email 失敗"
  }
   */
  '/verify', handleErrorAsync(MailServiceController.resendVerificationEmail));

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
