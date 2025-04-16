import { getAllTemplates, injectLiveReload } from "./template";
import express from "express";
import path from "path";
import { configs } from "./configfile";
import { renderedHtmlString } from "./render";

export function registerDevRoutes(app: express.Express, pd: string) {
  const routes = getAllTemplates(pd);
  for (const { fullPath, routePath } of routes) {
    const ext = path.extname(fullPath);
    if (configs.supportFiles.includes(ext)) {
      app.get(routePath, async (req, res) => {
        try {
          const htmlString = await renderedHtmlString(fullPath);
          if (!htmlString) {
            throw new Error("Error rendering HTML string");
          }
          res.send(injectLiveReload(htmlString));
        } catch (err) {
          console.error(err);
          res.status(500).send("Template error");
        }
      });
    }
  }
}

export function registerProdRoutes(app: express.Express, pd: string) {
  const routes = getAllTemplates(pd);
  for (const { fullPath, routePath } of routes) {
    app.get(routePath, (req, res) => {
      res.sendFile(fullPath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Template error");
        }
      });
    });
  }
}
