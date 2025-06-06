import path from "path";
import { getAllTemplates } from "./template";
import { BUILD_DIR, PAGES_DIR, configs, PUBLIC_DIR } from "./configfile";
import fs from "fs-extra";
import { renderedHtmlString } from "./render";

export async function productionBuild() {
  try {
    await fs.ensureDir(BUILD_DIR);

    await fs.emptyDir(BUILD_DIR);
    console.log("🧹 Cleared output directory.");

    const templates = getAllTemplates(PAGES_DIR);
    const outputPagesDir = path.join(
      BUILD_DIR,
      configs.build == "static" ? "" : "pages"
    );

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

    if (configs.build == "server") {
      const cjsCode = 'require("rstic").startLiveServer();';
      const esmCode = `import { startLiveServer } from 'rstic';\nstartLiveServer();`;
      await fs.writeFile(path.join(BUILD_DIR, "server.js"), cjsCode, "utf-8");
      await fs.writeFile(path.join(BUILD_DIR, "server.mjs"), esmCode, "utf-8");
      console.log("✅ server.js created in dist with live server code");
    }

    if (configs.build == "static") {
      const isPublicDirExist = await fs.pathExists(PUBLIC_DIR);
      if (isPublicDirExist) {
        await fs.copy(PUBLIC_DIR, BUILD_DIR);
      }
    }
  } catch (error) {
    console.error("❌ Error during build:", error);
  }

  process.exit(0);
}
