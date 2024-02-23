import http from "http";
import ViteExpress from "vite-express";
import mongoose from "mongoose";
import { createServer } from "vite";
import compression from "compression";
import { WebSocketServer } from "ws";
import "dotenv/config";

import app from "./index";
import { AuthService, PollService, webSocketService } from "@/services";
import { Logger } from "@/utils";
import { attachWsToRequest, initWebSocketServer } from "@/middleware";
const { DATABASE_PASSWORD, DATABASE_PATH } = process.env;

const isProduction = process.env.NODE_ENV === "production";
const base = process.env.BASE || "/";

import agenda from "@/services/AgendaService";
import { Poll } from "@/models";

mongoose.set("strictQuery", false);

mongoose
  .connect(DATABASE_PATH?.replace("<password>", `${DATABASE_PASSWORD}`) ?? "")
  .then(() => Logger.log("資料庫連線成功"))
  .catch((error) => Logger.warn(`資料庫連線錯誤: ${error.message}`));

const port = parseInt(process.env.PORT || "8081");
app.set("port", port);

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

initWebSocketServer(wss, server);
webSocketService(wss);
app.use(attachWsToRequest(wss));

agenda.define('check poll status', async () => {
  await PollService.startPollCheckService();
});

// 更新验证令牌的任务
agenda.define('update validation tokens', async () => {
  Logger.log('Running a job to update verification tokens', 'INFO');
  await AuthService.updateValidationToken();
});

server.on("error", (error) => {
  Logger.error(`伺服器錯誤： ${error}`);
});

ViteExpress.listen(app, port, () => {
  Logger.info(`伺服器正在PORT ${port} 上運行...`);
  let vite;
  if (!isProduction) {

    vite = createServer({
      server: { middlewareMode: true },
      appType: "custom",
      base,
    });
    app.use(vite.middlewares);
  } else {
    app.use(compression());
  }
  if (vite) {
      vite.watcher.on("change", (file) => {
        Logger.info(`${file} 已更新，重新載入伺服器...`);
        vite.ws.send({ type: "full-reload" });
      });
    }
});

server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  Logger.info("Listening on " + bind);
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});
