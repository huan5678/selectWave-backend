import { Logger } from "@/utils";
import { WebSocket } from "vite";
import { randomUUID } from "crypto";

export const webSocketService = (wss) =>
{

  wss.on('connection', (ws: WebSocket & {id: string}) =>
  {
    ws.id = randomUUID();

    wss.clients.forEach((client) =>
    {
      client.send(`Client ${ws.id} connected`);
    });

    ws.on('message', (message: string) => {
      Logger.info(`Received message: ${message}`);
      wss.clients.forEach((client) => {
        client.send(`Server received your message: ${message}`);
        Logger.log(`client id: ${client.id}`);
      });
    });

    ws.on('close', () => {
      Logger.info('Client disconnected');
    });
  });
};

export default webSocketService;
