import ViteExpress from "vite-express";
import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import "dotenv/config";

import app from "./index";
import { webSocketService } from "@/services";
import { Logger } from "@/utils";
import { attachWsToRequest, initWebSocketServer } from "@/middleware";
const { DATABASE_PASSWORD, DATABASE_PATH } = process.env;

const isProduction = process.env.NODE_ENV === "production";

import { AgendaService } from "@/services";
import { catchGlobalError } from "./exception";

mongoose.set("strictQuery", false);

mongoose
  .connect(DATABASE_PATH?.replace("<password>", `${DATABASE_PASSWORD}`) ?? "")
  .then(() => {
    Logger.log("資料庫連線成功");

    AgendaService.initializeAgenda().then(() => Logger.log("Agenda 初始化完成"));
  })
  .catch((error) => Logger.warn(`資料庫連線錯誤: ${error.message}`));

const port = parseInt(process.env.PORT || "8081");
app.set("port", port);
const server = ViteExpress.listen(app, port, () => {
  Logger.info(`伺服器正在 ${port} 上運行...`);
});
const wss = new WebSocketServer({ port: 8082 });

initWebSocketServer(wss, server);
app.use(attachWsToRequest(wss));
webSocketService(wss);

server.on("error", (error) => {
  Logger.error(`伺服器錯誤： ${error}`);
});

if (!isProduction) {
  ViteExpress.config({ mode: "development" });
} else {
  ViteExpress.config({ mode: "production" });
}

catchGlobalError();

process.on("SIGINT", async () => {
  await AgendaService.stopAgenda();
  Logger.log('Agenda has been stopped.');

  server.close(() => {
    Logger.log('HTTP server closed.');
    process.exit(0);
  });
});
