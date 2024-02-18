import { Router } from 'express';
import { ImgurController } from '@/controllers';
import { handleErrorAsync } from '@/utils';
import { upload } from '@/controllers/imgur.controller';

const imgurRouter = Router();

imgurRouter.post(
  /**
   * #swagger.tags = ['Imgur - 圖片']
   * #swagger.description = '上傳圖片'
   * #swagger.path = '/api/imgur/upload'
   * #swagger.consumes = ['multipart/form-data']
   * #swagger.parameters['singleFile'] = {
            in: 'formData',
            type: 'file',
            required: 'true',
            description: '上傳圖片',
            name: 'upload-image'
    }
  }
}
   * #swagger.responses[200] = {
      schema: {
        status: true,
        message: '上傳成功',
        result: 'https://i.imgur.com/xcLTrkV.png'
      },
      description: "上傳成功"
    }
    * #swagger.responses[401] = {
      schema: {
        $ref: "#/definitions/ErrorJsonWebToken"
      },
      description: "未登入"
    }
   * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/ErrorImageNotFound" },
      description: "請上傳檔案"
    }
    * #swagger.responses[500] = {
      schema: { $ref: "#/definitions/ErrorImageFormat" },
      description: "檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。 圖片大小不可超過 2MB"
    }
    * #swagger.security = [{ "Bearer": [] }]
   */
  '/upload',
  upload,
  handleErrorAsync(ImgurController.createImgurHandler)
);

export default imgurRouter;
