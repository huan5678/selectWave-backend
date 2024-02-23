/// <reference types="vite/client" />
// 在 global.d.ts 或其他 TypeScript 定義文件中
import { WebSocketServer } from "ws";

declare global {
  namespace Express {
    interface Request {
      wss?: WebSocketServer;
    }
  }
}
