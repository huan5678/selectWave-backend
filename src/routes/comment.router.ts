import { ReplyController, CommentController } from "@/controllers";
import { handleErrorAsync } from "@/utils";
import { Router } from "express";

const commentRouter = Router();

commentRouter.get(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '獲取使用者所有評論'
   * #swagger.path = '/api/comment'
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
* #swagger.security = [{
  "Bearer": []
}]
}*/
  "/",
  handleErrorAsync(CommentController.getComments)
);
commentRouter.get(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '獲取評論'
   * #swagger.path = '/api/comment/{id}'
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
   * #swagger.path = '/api/comment/'
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
  schema: { $ref: "#/definitions/ErrorFormat" },
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
   * #swagger.path = '/api/comment/{id}'
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
  schema: { $ref: "#/definitions/ErrorNotFound" },
  description: "找不到評論"
}
* #swagger.responses[403] = {
  schema: { $ref: "#/definitions/ErrorUnauthorized" },
  description: "沒有權限更新評論"
}
* #swagger.responses[400] = {
  schema: { $ref: "#/definitions/ErrorFormat" },
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
   * #swagger.path = '/api/comment/{id}'
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

commentRouter.get(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '獲取使用者所有回覆評論'
   * #swagger.path = '/api/comment/reply/user'
   * #swagger.responses[200] = {
      schema: {
        status: true,
        message: "獲取回覆成功",
        result: { $ref: "#/definitions/Reply" },
      },
      description: "獲取回覆成功"
    }
    * #swagger.security = [{
      "Bearer": []
    }]
    */
  "/reply/user",
  handleErrorAsync(ReplyController.getReplyByUser)
);

// 新增回覆
commentRouter.post(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '新增回覆'
   * #swagger.path = '/api/comment/{id}/reply'
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
      description: '新增回覆',
      schema: {
        content: '這是一則回覆'
      }
    }
    * #swagger.responses[200] = {
      schema: {
        status: true,
        message: "回覆創建成功",
        result: { $ref: "#/definitions/Comment" },
      },
      description: "回覆創建成功"
    }
    * #swagger.responses[400] = {
      schema: { $ref: "#/definitions/ErrorCommentFormat" },
      description: "請確實填寫回覆資訊"
    }
    * #swagger.security = [{
      "Bearer": []
    }]
    */
  "/:id/reply",
  handleErrorAsync(ReplyController.createReply)
);

// 更新回覆
commentRouter.put(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '更新回覆'
   * #swagger.path = '/api/comment/reply/{id}'
   * #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: '回覆ID'
    }
    * #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      type: 'object',
      description: '更新回覆',
      schema: {
        content: '這是一則更新後的回覆'
      }
    }
    * #swagger.responses[200] = {
      schema: {
        status: true,
        message: "回覆更新成功",
        result: { $ref: "#/definitions/Comment" },
      },
      description: "回覆更新成功"
    }
    * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/ErrorNotFound" },
      description: "找不到回覆"
    }
    * #swagger.responses[403] = {
      schema: { $ref: "#/definitions/ErrorUnauthorized" },
      description: "沒有權限更新回覆"
    }
    * #swagger.responses[400] = {
      schema: { $ref: "#/definitions/ErrorFormat" },
      description: "請確實填寫回覆資訊"
    }
    * #swagger.security = [{
      "Bearer": []
    }]
    */
  "/reply/:id",
  handleErrorAsync(ReplyController.updateReply)
);

// 刪除回覆
commentRouter.delete(
  /**
   * #swagger.tags = ['Comment - 評論']
   * #swagger.description = '刪除回覆'
   * #swagger.path = '/api/comment/reply/{id}'
   * #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      type: 'string',
      description: '回覆ID'
    }
    * #swagger.responses[200] = {
      schema: {
        status: true,
        message: "回覆刪除成功",
      },
      description: "回覆刪除成功"
    }
    * #swagger.responses[404] = {
      schema: { $ref: "#/definitions/ErrorNotFound" },
      description: "找不到回覆"
    }
    * #swagger.responses[403] = {
      schema: { $ref: "#/definitions/ErrorUnauthorized" },
      description: "沒有權限刪除回覆"
    }
    * #swagger.security = [{
      "Bearer": []
    }]
    */
  "/reply/:id",
  handleErrorAsync(ReplyController.deleteReply)
);


export default commentRouter;
