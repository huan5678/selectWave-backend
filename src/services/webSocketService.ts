import { Logger, verifyToken } from "@/utils";
import { WebSocket } from "vite";
import { randomUUID } from "crypto";
import { User } from "@/models";

export const webSocketService = (wss) => {
  wss.on("connection", (ws: WebSocket & { id: string, userId: string }) => {
    ws.id = randomUUID();

    Logger.info(`${ws.id} connected`);

    ws.on("message", async (message) =>
    {
      try {
      const data = JSON.parse(message.toString());
      if (data.type === "auth") {
        // 處理身份驗證
        const token = data.token;
        // 驗證 token 的邏輯...
        const {userId} = verifyToken(token);
        if (!userId) {
          ws.send(JSON.stringify({ type: "auth", result: false }));
          return;
        }
        const member = await User.findById(userId).select('name').exec();
        if (member) {
            Logger.info(`Client ${ws.id} User#${member.id} - ${member.name} authenticated`);
            ws.userId = member.id;
            ws.send(JSON.stringify({ type: "auth", result: true, userId: member.id, name: member.name }));
          } else {
            ws.send(JSON.stringify({ type: "auth", result: false }));
          }
        } else {
          Logger.info(`Received message from Client ${ws.id}: ${message}`);
        }
      } catch (error) {
        Logger.error(`Error handling message from Client ${ws.id}: ${(error as Error).message}`);
      }
    });

    ws.on("close", () => {
      Logger.info(`Client ${ws.id} disconnected`);
    });
  });
};

export default webSocketService;
