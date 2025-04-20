import { Command } from "commander";

export const program = new Command();

program
  .name("rstic")
  .description("RSTIC static-site tool")
  .option("-c, --config <path>", "path to config file")
  .option("--pages-dir <dir>", "source pages directory")
  .option("--output-dir <dir>", "output directory for generated files")
  .option(
    "--watch-dirs <dirs>",
    "directories to watch (comma-separated)",
    (val) => val.split(",")
  )
  .option(
    "--watch-files <exts>",
    "file extensions to watch (comma-separated)",
    (val) => val.split(",")
  )
  .option(
    "--support-files <exts>",
    "support file extensions (comma-separated)",
    (val) => val.split(",")
  )
  .option("--public-dir <dir>", "static public directory")
  .option("-b, --build <mode>", "build mode ('static' or 'server')")
  .option("-p, --port <number>", "port to listen on", (v) => parseInt(v, 10));

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
