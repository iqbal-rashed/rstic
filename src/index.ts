#!/usr/bin/env node
import { Command } from 'commander';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { renderFile } from './template';
import { debounce } from './utils';

const program = new Command();
const cwd = process.cwd();

function getPagesDir(baseDir: string) {
  const rootPagesDirPath = path.join(baseDir, 'pages');
  const srcPagesDirPath = path.join(baseDir, 'src/pages');

  const hasSrcPages = fs.existsSync(srcPagesDirPath);
  const hasPages = fs.existsSync(rootPagesDirPath);

  if (!hasSrcPages && !hasPages) {
    console.error(
      "❌ No pages directory found. Expected 'pages/' or 'src/pages/'"
    );
    process.exit(1);
  }
  return hasSrcPages ? srcPagesDirPath : rootPagesDirPath;
}

const pagesDir = getPagesDir(cwd);
const publicDir = path.join(cwd, 'public');

function getData(templatePath: string) {
  const jsonPath = templatePath.replace(/\.[a-z]+$/, '.json');
  if (fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  }
  return {};
}

function getAllTemplates(
  dir = pagesDir,
  prefix = ''
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
      (entry.endsWith('.ejs') || entry.endsWith('.html')) &&
      !entry.startsWith('_')
    ) {
      const routePath =
        entry === 'index.ejs' || entry === 'index.html'
          ? prefix || '/'
          : `${prefix}/${name}`;
      pages.push({ fullPath, routePath });
    }
  }

  return pages;
}

function injectLiveReload(htmlContent: string) {
  const wsScript = `
    <script>
      const ws = new WebSocket("ws://" + location.host);
      ws.onmessage = (event) => {
        if (event.data === "reload") location.reload();
      };
    </script>
  `;

  if (htmlContent.includes('</body>')) {
    htmlContent = htmlContent.replace('</body>', `${wsScript}\n</body>`);
  }
  return htmlContent;
}

function registerExpressRoutes(app: express.Express) {
  const routes = getAllTemplates();
  for (const { fullPath, routePath } of routes) {
    app.get(routePath, async (req, res) => {
      const ext = path.extname(fullPath);
      const data = getData(fullPath);

      try {
        const template = fs.readFileSync(fullPath, 'utf-8');

        const htmlString = injectLiveReload(template);

        if (ext === '.html') {
          const html = await renderFile(fullPath, htmlString, data);
          res.send(html);
        } else {
          const html = await ejs.render(htmlString, data, {
            async: true,
            filename: fullPath,
          });
          res.send(html);
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Template error');
      }
    });
  }
}

const watcher = chokidar.watch([pagesDir, publicDir], { ignoreInitial: true });
const pagesFilesWatcher = chokidar.watch(pagesDir, { ignoreInitial: true });

function initServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  app.use(express.static(publicDir));

  registerExpressRoutes(app);

  const debounceBroadcastReload = debounce(broadcastReload, 500);

  watcher.on('change', (filePath) => {
    console.log(`File changed: ${path.basename(filePath)}`);
    debounceBroadcastReload();
  });
  const debounceInitServer = debounce(initServer, 500);
  function restart() {
    if (server && server.close) {
      server.close(() => {
        server.closeAllConnections();
        console.log('🔁 Restarting server...');

        debounceInitServer();
      });
    }
  }

  const debouncedRestart = debounce(restart, 500);

  pagesFilesWatcher.on('add', (filePath) => {
    if (filePath.startsWith(pagesDir)) {
      console.log(
        `New file added: ${path.basename(filePath)} — restarting server...`
      );
      debouncedRestart();
    }
  });

  pagesFilesWatcher.on('unlink', (filePath) => {
    if (filePath.startsWith(pagesDir)) {
      console.log(
        `File removed: ${path.basename(filePath)} — restarting server...`
      );
      debouncedRestart();
    }
  });

  const PORT = 3003;
  server.listen(PORT, () => {
    console.log(`🚀 Dev server running at http://localhost:${PORT}`);
  });

  function broadcastReload() {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send('reload');
      }
    });
  }

  return server;
}

program
  .command('dev')
  .description('Run Express dev server with live reload')
  .action(() => {
    initServer();
  });

program.parse(process.argv);
