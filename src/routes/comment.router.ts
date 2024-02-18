import CommentController from "@/controllers/comment.controller";
import { handleErrorAsync } from "@/utils";
import { Router } from "express";

const commentRouter = Router();

commentRouter.get(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '獲取評論'
   * #swagger.parameters['id'] = {
  in: 'path',
  required: true,
  type: 'string',
  description: '評論ID'
}
* #swagger.responses[200] = {
  schema: {
    status: true,
    message: "獲取評論成功",
    result: { $ref: "#/definitions/Comment" },
  },
  description: "獲取評論成功"
}
* #swagger.responses[404] = {
  schema: { $ref: "#/definitions/ErrorCommentNotFound" },
  description: "找不到評論"
}
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
    pollId: '60f3e3e3e3e3e3e3e3e3e3e3',
    content: '這是一則評論'
  }
}
* #swagger.responses[200] = {
  schema: {
    status: true,
    message: "評論創建成功",
    result: { $ref: "#/definitions/Comment" },
  },
  description: "評論創建成功"
}
* #swagger.responses[400] = {
  schema: { $ref: "#/definitions/ErrorCommentFormat" },
  description: "請確實填寫評論資訊"
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
    commentId: '60f3e3e3e3e3e3e3e3e3e3e3',
    content: '這是一則更新後的評論'
  }
}
* #swagger.responses[200] = {
  schema: {
    status: true,
    message: "評論更新成功",
    result: {
    $ref: "#/definitions/Comment" },
  },
  description: "評論更新成功"
}
* #swagger.responses[404] = {
  schema: { $ref: "#/definitions/ErrorCommentNotFound" },
  description: "找不到評論"
}
* #swagger.responses[403] = {
  schema: { $ref: "#/definitions/ErrorCommentUnauthorized" },
  description: "沒有權限更新評論"
}
* #swagger.responses[400] = {
  schema: { $ref: "#/definitions/ErrorCommentFormat" },
  description: "請確實填寫評論資訊"
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
  schema: {
    status: true,
    message: "評論刪除成功",
  },
  description: "評論刪除成功"
}
* #swagger.responses[404] = {
  schema: { $ref: "#/definitions/ErrorCommentNotFound" },
  description: "找不到評論"
}
* #swagger.security = [{
  "Bearer": []
}]
*/
  "/:id",
  handleErrorAsync(CommentController.deleteComment)
);

export default commentRouter;
