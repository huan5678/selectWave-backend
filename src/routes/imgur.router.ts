import { Router } from 'express';
import { ImgurController } from '@/controllers';
import { handleErrorAsync } from '@/utils';
import { upload } from '@/controllers/imgur.controller';

const imgurRouter = Router();

imgurRouter.post(
  /**
   * #swagger.tags = ['Imgur - 圖片']
   * #swagger.description = '上傳圖片'
   * #swagger.parameters['body'] = {
  in: 'body',
  required: true,
  type: 'object',
  description: '上傳圖片',
  schema: {
    properties: {
      image: { type: "string" }
    }
  }
}
   * #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Success" },
      description: "上傳成功"
    }
   * #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: "上傳失敗"
    }
  * #swagger.responses[401] = {
      schema: { $ref: "#/definitions/Error" },
      description: "未登入"
    }
    * #swagger.responses[403] = {
      schema: { $ref: "#/definitions/Error" },
      description: "圖片格式錯誤"
    }
    * #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: "上傳失敗"
    }
    * #swagger.security = [{ "Bearer": [] }]
   */
  '/',
  upload,
  handleErrorAsync(ImgurController.createImgurHandler)
);

export default imgurRouter;
