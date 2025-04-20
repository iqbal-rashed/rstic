import express from "express";
import { registerProdRoutes } from "./routes";
import path from "path";
import { BASE_DIR } from "./constans";
import { configs } from "./configfile";
import { program } from "./prompts";

const PAGES_DIR = path.join(BASE_DIR, configs.outputDir, "pages");
const PUBLIC_DIR = path.join(BASE_DIR, configs.publicDir);

const configPort = program.opts().port || 3003;

export function startLiveServer() {
  const app = express();
  app.use(express.static(PUBLIC_DIR));

  registerProdRoutes(app, PAGES_DIR);

  const PORT = process.env.PORT || Number(configPort);
  app.listen(PORT, () => {
    console.log(`🚀 Live server running at http://localhost:${PORT}`);
  });
}
