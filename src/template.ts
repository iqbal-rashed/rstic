import fs from "fs";
import path from "path";
import { configs } from "./configfile";
import { withoutExt } from "./utils";

export function getAllTemplates(
  dir: string,
  prefix = ""
): { fullPath: string; routePath: string }[] {
  const entries = fs.readdirSync(dir);
  const pages: { fullPath: string; routePath: string }[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    const name = path.parse(entry).name;
    if (stat.isDirectory()) {
      pages.push(...getAllTemplates(fullPath, `${prefix}/${name}`));
    } else if (
      configs.supportFiles.includes(path.extname(entry)) &&
      !entry.startsWith("_")
    ) {
      const routePath =
        withoutExt(entry) == "index" ? "/" : `${prefix}/${name}`;
      pages.push({ fullPath, routePath });
    }
  }

  return pages;
}

export function injectLiveReload(htmlContent: string) {
  const wsScript = `
    <script>
      const ws = new WebSocket("ws://" + location.host);
      ws.onmessage = (event) => {
        if (event.data === "reload") location.reload();
      };
    </script>
  `;

  if (htmlContent.includes("</body>")) {
    htmlContent = htmlContent.replace("</body>", `${wsScript}\n</body>`);
  } else {
    htmlContent = htmlContent + "\n" + wsScript;
  }
  return htmlContent;
}
