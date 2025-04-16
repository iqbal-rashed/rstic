// #!/usr/bin/env node
import { Command } from "commander";
import { startDevServer } from "./dev.server";
import { productionBuild } from "./build";
import { startLiveServer } from "./live.server";
const program = new Command();

program
  .command("dev")
  .description("Run Express dev server with live reload")
  .action(startDevServer);

program
  .command("build")
  .description("Build static page")
  .action(productionBuild);

program
  .command("start")
  .description("Start live server")
  .action(startLiveServer);

program.parse(process.argv);

export const liveServer = startLiveServer;
