#!/usr/bin/env node
import { Command } from "commander";
import { startDevServer } from "./dev.server";
import { productionBuild } from "./build";
import { startLiveServer } from "./live.server";

const program = new Command();

program
  .command("build")
  .description("Build static pages")
  .action(() => {
    productionBuild();
  });

program
  .command("start")
  .description("Start live server")
  .action(() => {
    startLiveServer();
  });

program
  .command("dev")
  .description("Run dev server with live reload")
  .action(() => {
    startDevServer();
  });

program.parse(process.argv);
