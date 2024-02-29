import { Router } from 'express';
import TagController from '@/controllers/tag.controller';
import { handleErrorAsync } from '@/utils';

const tagRouter = Router();

tagRouter.get(
  /**
   * #swagger.tags = ['Tag - 標籤']
   * #swagger.description = '獲取所有標籤'
   * #swagger.path = '/api/tag/'
   * #swagger.parameters['q'] = {
    in: 'query',
    required: false,
    type: 'string',
    description: '搜尋關鍵字',
    }
    * #swagger.parameters['q'] = {
      in: 'query',
      required: false,
      type: 'string',
      description: '搜尋關鍵字',
    }
    * #swagger.parameters['sort'] = {
      in: 'query',
      required: false,
      type: 'string',
      description: '排序欄位 使用欄位名稱表示升冪 例如: createdTime, 加上-為降冪 例如: -createdTime',
    }
   * #swagger.responses[200] = {
    schema: {
      status: true,
      message: "成功取得標籤列表",
      result: [
        {
          $ref: "#/definitions/Tag"
        }
      ]
    },
    description: "獲取標籤列表成功"
  }
    */
  '/',
  handleErrorAsync(TagController.getTags));

tagRouter.get(
  /**
   * #swagger.tags = ['Tag - 標籤']
   * #swagger.description = '根據 ID 獲取標籤詳情'
   * #swagger.path = '/api/tag/{id}'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '標籤ID'
    }
    * #swagger.responses[200] = {
      schema: {
        status: true,
        message: "成功取得標籤資訊",
        result: {
          $ref: "#/definitions/Tag"
        }
      },
      description: "獲取標籤詳情成功"
    }
   */
  '/:id',
  handleErrorAsync(TagController.getTagById));

tagRouter.post(
  /**
   * #swagger.tags = ['Tag - 標籤']
   * #swagger.description = '新增標籤'
   * #swagger.path = '/api/tag/'
   * #swagger.parameters['name'] = {
    in: 'body',
    required: true,
    type: 'string',
    description: '標籤名稱'
    }
    * #swagger.responses[200] = {
      schema: {
        status: true,
        message: "標籤創建成功",
        result: {
          $ref: "#/definitions/Tag"
        }
      },
      description: "標籤創建成功"
    }
   */
  '/',
  handleErrorAsync(TagController.createTag));

tagRouter.put(
  /**
   * #swagger.tags = ['Tag - 標籤']
   * #swagger.description = '更新標籤'
   * #swagger.path = '/api/tag/{id}'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '標籤ID'
    }
    * #swagger.parameters['name'] = {
      in: 'body',
      required: true,
      type: 'string',
      description: '標籤名稱'
    }
    * #swagger.responses[200] = {
      schema: {
        status: true,
        message: "標籤更新成功",
        result: {
          $ref: "#/definitions/Tag"
        }
      },
      description: "標籤更新成功"
    }
   */
  '/:id',
  handleErrorAsync(TagController.updateTag));

tagRouter.delete(
  /**
   * #swagger.tags = ['Tag - 標籤']
   * #swagger.description = '刪除標籤'
   * #swagger.path = '/api/tag/{id}'
   * #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: '標籤ID'
    }
    * #swagger.responses[200] = {
      schema: {
        status: true,
        message: "標籤刪除成功",
        result: {
          $ref: "#/definitions/Tag"
        }
      },
      description: "標籤刪除成功"
    }
   */
  '/:id',
  handleErrorAsync(TagController.deleteTag));

export default tagRouter;