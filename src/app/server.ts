import http from "http";
import ViteExpress from "vite-express";
import mongoose from "mongoose";

import "dotenv/config";

import app from "./index";
import { AuthService, PollService, webSocketService } from "@/services";
import { Logger } from "@/utils";
import { attachWsToRequest, initWebSocketServer } from "@/middleware";
import { WebSocketServer } from "ws";

const { DATABASE_PASSWORD, DATABASE_PATH } = process.env;
const isProduction = process.env.NODE_ENV === "production";
const base = process.env.BASE || "/";

mongoose.set("strictQuery", false);

mongoose
  .connect(DATABASE_PATH?.replace("<password>", `${DATABASE_PASSWORD}`) ?? "")
  .then(() => Logger.log("資料庫連線成功"))
  .catch((error: Error) => Logger.warn(`資料庫連線錯誤: ${error.message}`));

const port = parseInt(process.env.PORT || "8081");

app.set("port", port);

let vite;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import("compression")).default;
  app.use(compression());
}

const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

initWebSocketServer(server);
attachWsToRequest(wss);
webSocketService(wss);



server.on("error", (error) => {
  Logger.error(`伺服器錯誤： ${error}`);
});

Logger.info(`設置的PORT是：${port}`);


ViteExpress.listen(app, port, () => {
  Logger.info(`伺服器正在PORT ${port} 上運行...`);

  if (vite) {
    vite.watcher.on("change", (file) => {
      Logger.info(`${file} 已更新，重新載入伺服器...`);
      vite.ws.send({ type: "full-reload" });
    });
  }
  AuthService.updateValidationToken();
  PollService.startPollCheckService();
});

server.on("listening", () => {
  const addr = server.address();
  if (!addr) {
    return console.error("cannot get the address from server");
  }
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  Logger.info("Listening on " + bind);
});

process.on("SIGINT", () => {
  console.log("close server");
  server.close(() => {
    console.log("kill Node process");
    process.exit(0);
  });
});
