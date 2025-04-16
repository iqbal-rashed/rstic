import path from "path";
import fs from "fs-extra";
import { configs } from "./configfile";
import { BASE_DIR } from "./constans";

export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  delay: number
): F {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  } as F;
}

export function getPagesDir(baseDir: string = BASE_DIR) {
  const pagesDirPath = path.join(baseDir, configs.pagesDir);
  const hasPages = fs.existsSync(pagesDirPath);

  if (!hasPages) {
    console.error(
      "❌ No pages directory found. Expected 'pages/' or 'src/pages/'"
    );
    process.exit(1);
  }
  return pagesDirPath;
}

export async function getData(templatePath: string) {
  try {
    const jsonPath = templatePath.replace(path.extname(templatePath), ".json");
    const isExist = await fs.exists(jsonPath);
    if (!isExist) {
      throw new Error("File not found");
    }
    const data = await fs.readJson(jsonPath);
    if (!data) throw new Error("File not found");
    return data;
  } catch {
    return {};
  }
}

export const withoutExt = (filename: string) =>
  path.basename(filename, path.extname(filename));
