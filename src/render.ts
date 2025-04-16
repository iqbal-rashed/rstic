import fs from "fs-extra";
import { getData } from "./utils";
import path from "path";
import { renderFile } from "./engine";
import ejs from "ejs";

export const renderedHtmlString = async (fullPath: string) => {
  try {
    const htmlString = await fs.readFile(fullPath, "utf-8");
    const data = await getData(fullPath);
    const ext = path.extname(fullPath);
    if (ext === ".html") {
      const html = await renderFile(fullPath, htmlString, data);
      return html;
    } else if (ext === ".ejs") {
      const html = await ejs.render(htmlString, data, {
        async: true,
        filename: fullPath,
      });
      return html;
    } else {
      return htmlString;
    }
  } catch (error) {
    console.error(`Error reading file ${fullPath}:`, error);
    return null;
  }
};
