export interface RsticConfig {
  pagesDir: string;
  outputDir: string;
  watchDirs: string | string[];
  watchFiles: string[];
  supportFiles: string[];
  publicDir: string;
}
