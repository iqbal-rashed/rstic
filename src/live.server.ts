import express from "express";
import http from "http";
import { registerProdRoutes } from "./routes";
import path from "path";
import { BASE_DIR } from "./constans";
import { configs } from "./configfile";

const PAGES_DIR = path.join(BASE_DIR, configs.outputDir, "pages");
const PUBLIC_DIR = path.join(BASE_DIR, configs.publicDir);

export function startLiveServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.static(PUBLIC_DIR));

  registerProdRoutes(app, PAGES_DIR);

  const PORT = 3003;
  server.listen(PORT, () => {
    console.log(`🚀 Live server running at http://localhost:${PORT}`);
  });
}
