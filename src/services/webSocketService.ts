import { Logger } from "@/utils";
import { WebSocket } from "vite";
import { WebSocketServer } from 'ws';

const webSocketService = (port) =>
{

  const wss = new WebSocketServer({ port });

  Logger.log(`WebSocket server is running on port ${port}`);

  wss.on('connection', (ws: WebSocket) =>
  {
    Logger.log('New client connected');

    ws.on('message', (message: string) => {
      console.log(`Received message: ${message}`);
      wss.clients.forEach((client) => {
        client.send(`Server received your message: ${message}`);
      });
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};

export default webSocketService;
