import path from "path";
import { getAllTemplates } from "./template";
import { BUILD_DIR, PAGES_DIR } from "./configfile";
import fs from "fs-extra";
import { renderedHtmlString } from "./render";

export async function productionBuild() {
  try {
    await fs.emptyDir(BUILD_DIR);
    console.log("🧹 Cleared output directory.");

    const templates = getAllTemplates(PAGES_DIR);
    const outputPagesDir = path.join(BUILD_DIR, "pages");

    await fs.ensureDir(outputPagesDir);

    for (const { fullPath, routePath } of templates) {
      try {
        const htmlString = await renderedHtmlString(fullPath);
        if (!htmlString)
          throw new Error(`Error rendering HTML for ${routePath}`);

        await fs.writeFile(
          path.join(outputPagesDir, path.basename(fullPath)),
          htmlString,
          "utf-8"
        );

        console.log(`✅ Built: ${routePath}`);
      } catch (err) {
        console.error(`❌ Error building ${routePath}:`, err);
      }
    }

    const serverFilePath = path.join(BUILD_DIR, "server.js");
    const serverCode = 'require("rstic").liveServer();';
    await fs.writeFile(serverFilePath, serverCode, "utf-8");
    console.log("✅ server.js created in dist with live server code");
  } catch (error) {
    console.error("❌ Error during build:", error);
  }

  process.exit(0);
}
