import { cosmiconfigSync } from "cosmiconfig";
import { TypeScriptLoader } from "cosmiconfig-typescript-loader";
import { BASE_DIR } from "./constans";
import path from "path";
import { program } from "./prompts";

const moduleName = "rstic";

const programOpts = program.opts();

const configFile = programOpts.config || null;

const explorer = cosmiconfigSync(moduleName, {
  searchPlaces: [
    "package.json",
    `.${moduleName}rc`,
    `.${moduleName}rc.json`,
    `.${moduleName}rc.yaml`,
    `.${moduleName}rc.yml`,
    `.${moduleName}rc.js`,
    `.${moduleName}rc.ts`,
    `.${moduleName}rc.cjs`,
    `${moduleName}.config.js`,
    `${moduleName}.config.ts`,
    `${moduleName}.config.cjs`,
  ].concat(configFile ? [configFile] : []),
  loaders: {
    ".ts": TypeScriptLoader(),
  },
});

export interface RsticConfig {
  pagesDir: string;
  outputDir: string;
  watchDirs: string | string[];
  watchFiles: string[];
  supportFiles: string[];
  publicDir: string;
  build: "static" | "server";
  port: number;
}

const defaultConfig: RsticConfig = {
  pagesDir: "src/pages",
  outputDir: "dist",
  watchDirs: ["src"],
  watchFiles: [".html", ".ejs", ".css", ".js", ".json"],
  supportFiles: [".html", ".ejs"],
  publicDir: "public",
  build: programOpts.build || "server",
  port: 3003,
};

const searchedFor = explorer.search(BASE_DIR);

export const configs: RsticConfig = {
  ...defaultConfig,
  ...searchedFor?.config,
};

export const PAGES_DIR = path.join(BASE_DIR, configs.pagesDir);

export const PUBLIC_DIR = path.join(BASE_DIR, configs.publicDir);

export const BUILD_DIR = path.join(BASE_DIR, configs.outputDir);
