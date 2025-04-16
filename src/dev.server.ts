import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { debounce } from "./utils";
import { registerDevRoutes } from "./routes";
import { pagesWatcher, watcher } from "./watcher";
import path from "path";
import { PAGES_DIR, PUBLIC_DIR } from "./configfile";

export function startDevServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  app.use(express.static(PUBLIC_DIR));

  registerDevRoutes(app, PAGES_DIR);

  const debounceBroadcastReload = debounce(broadcastReload, 500);

  watcher.on("change", (filePath) => {
    console.log(`File changed: ${path.basename(filePath)}`);
    debounceBroadcastReload();
  });

  const debouncedReroute = debounce(() => {
    registerDevRoutes(app, PAGES_DIR);
  }, 500);

  pagesWatcher.on("add", (filePath) => {
    console.log("File Changed ", path.basename(filePath));
    debouncedReroute();
  });

  pagesWatcher.on("unlink", (filePath) => {
    console.log("File Changed ", path.basename(filePath));
    debouncedReroute();
  });

  const PORT = 3003;
  server.listen(PORT, () => {
    console.log(`🚀 Dev server running at http://localhost:${PORT}`);
  });

  function broadcastReload() {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send("reload");
      }
    });
  }
}
