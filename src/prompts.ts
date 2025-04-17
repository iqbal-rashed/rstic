import { Command } from "commander";

export const program = new Command();

program
  .name("rstic")
  .description("RSTIC static‑site tool")
  .option("-c, --config <path>", "path to config file")
  .option(
    "-p, --port <number>",
    "port to listen on",
    (v) => parseInt(v, 10),
    3003
  );

program
  .command("build")
  .description("Build static pages")
  .action(() => {
    import("./build").then(({ productionBuild }) => {
      productionBuild();
    });
  });

program
  .command("start")
  .description("Start live server")
  .action(() => {
    import("./live.server").then(({ startLiveServer }) => {
      startLiveServer();
    });
  });

program
  .command("dev")
  .description("Run dev server with live reload")
  .action(() => {
    import("./dev.server").then(({ startDevServer }) => {
      startDevServer();
    });
  });
