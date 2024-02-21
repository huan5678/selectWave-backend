import { Logger } from "@/utils";

const webSocketService = async (io) =>
{
  io.on('connection', async (socket) =>
  {
    console.log(socket);
    Logger.info(`user ${socket.id} connection`);

    socket.on('disconnect', () => {
      Logger.info('disconnected from user');
    });
  });
};

export default webSocketService;