import CommentController from "@/controllers/comment.controller";
import { isAuthor } from "@/middleware";
import { handleErrorAsync } from "@/utils";
import { Router } from "express";

const commentRouter = Router();

commentRouter.get(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '獲取所有評論'
   * #swagger.parameters['id'] = {
  in: 'path',
  required: true,
  type: 'string',
  description: '評論ID'
}
* #swagger.responses[200] = {
  schema: { $ref: "#/definitions/Comment" },
  description: "獲取評論成功"
}
* #swagger.responses[404] = {
  schema: { $ref: "#/definitions/Error" },
  description: "找不到評論"
}
* #swagger.responses[500] = {
  schema: { $ref: "#/definitions/Error" },
  description: "獲取評論失敗"
}*/

  "/:id",
  handleErrorAsync(CommentController.getComment)
);

commentRouter.post(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '新增評論'
   *  #swagger.parameters['body'] = {
  in: 'body',
  required: true,
  type: 'object',
  description: '新增評論',
  schema: {
    properties: {
      userId: { type: 'string' },
      content: { type: 'string' }
    }
  }
}
* #swagger.responses[200] = {
  schema: { $ref: "#/definitions/Comment" },
  description: "評論創建成功"
}
* #swagger.responses[500] = {
  schema: { $ref: "#/definitions/Error" },
  description: "評論創建失敗"
}
* #swagger.security = [{
  "Bearer": []
}] */
  "/",
  
  handleErrorAsync(CommentController.createComment)
);

commentRouter.put(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '更新評論'
  * #swagger.parameters['id'] = {
  in: 'path',
  required: true,
  type: 'string',
  description: '評論ID'
}
* #swagger.parameters['body'] = {
  in: 'body',
  required: true,
  type: 'object',
  description: '更新評論',
  schema: {
    properties: {
      content: { type: 'string' }
    }
  }
}
* #swagger.responses[200] = {
  schema: { $ref: "#/definitions/Comment" },
  description: "評論更新成功"
}
* #swagger.responses[404] = {
  schema: { $ref: "#/definitions/Error" },
  description: "找不到評論"
}
* #swagger.responses[500] = {
  schema: { $ref: "#/definitions/Error" },
  description: "評論更新失敗"
}
* #swagger.security = [{
  "Bearer": []
}] */
  "/:id",
  
  handleErrorAsync(CommentController.updateComment)
);

commentRouter.delete(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '刪除評論'
   *  #swagger.parameters['id'] = {
  in: 'path',
  required: true,
  type: 'string',
  description: '評論ID'
}
* #swagger.responses[200] = {
  schema: { $ref: "#/definitions/Comment" },
  description: "評論刪除成功"
}
* #swagger.responses[404] = {
  schema: { $ref: "#/definitions/Error" },
  description: "找不到評論"
}
* #swagger.responses[500] = {
  schema: { $ref: "#/definitions/Error" },
  description: "評論刪除失敗"
}
* #swagger.security = [{
  "Bearer": []
}]
*/
  "/:id",
  
  handleErrorAsync(CommentController.deleteComment)
);

export default commentRouter;
