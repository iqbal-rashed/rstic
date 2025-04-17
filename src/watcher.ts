import chokidar from "chokidar";
import { configs } from "./configfile";
import path from "path";
import { BASE_DIR } from "./constans";

const PAGES_DIR = path.join(BASE_DIR, configs.pagesDir);

export const WATCH_DIRS = ([] as string[])
  .concat(configs.watchDirs, configs.publicDir)
  .map((v) => path.join(BASE_DIR, v));

export const getWatcher = () =>
  chokidar.watch(WATCH_DIRS, {
    ignored: (filePath, stats) => {
      if (stats && stats.isFile()) {
        const ext = path.extname(filePath);
        return !configs.watchFiles.includes(ext);
      }

      return false;
    },
    ignoreInitial: true,
  });

export const getPagesWatcher = () =>
  chokidar.watch(PAGES_DIR, {
    ignoreInitial: true,
  });
