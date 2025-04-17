import fs from "fs-extra";
import path from "path";
import vm from "vm";
import { parse, HTMLElement } from "node-html-parser";

export interface TemplateData {
  [key: string]: any;
}

function getValueByPath(obj: any, pathStr: string): any {
  return pathStr.split(".").reduce((acc, key) => acc?.[key], obj);
}

function processInlineExpressions(str: string, data: TemplateData): string {
  const sandbox = { ...(data || {}) };
  const context = vm.createContext(sandbox);

  return str.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
    try {
      return vm.runInContext(`(${expr})`, context);
    } catch (err) {
      console.warn("Template expression error:", expr, err);
      return "";
    }
  });
}

async function renderTemplate(
  template: string,
  data: TemplateData,
  baseDir: string
): Promise<string> {
  const root = parse(template, { comment: true });

  await processIncludeTags(root, data, baseDir);
  await processLoopTags(root, data, baseDir);
  await processIfTags(root, data, baseDir);
  await processValueTags(root, data);

  const out = root.toString();
  return processInlineExpressions(out, data);
}

async function processIncludeTags(
  root: HTMLElement,
  data: TemplateData,
  baseDir: string
) {
  const includeTags = root.querySelectorAll("include");
  for (const tag of includeTags) {
    const includePath = tag.getAttribute("src");
    if (!includePath) continue;

    const passed: Record<string, any> = {};
    for (const [name, value] of Object.entries(tag.attributes)) {
      if (name === "src") continue;
      passed[name] = processInlineExpressions(value, data);
    }

    const includeContext = { ...data, ...passed };

    const fullPath = path.resolve(baseDir, includePath);
    const content = await fs.readFile(fullPath, "utf8");
    const rendered = await renderTemplate(
      content,
      includeContext,
      path.dirname(fullPath)
    );

    tag.replaceWith(parse(rendered));
  }
}

function processValueTags(root: HTMLElement, data: TemplateData): void {
  const valueTags = root.querySelectorAll("value");
  valueTags.forEach((tag) => {
    const key = tag.getAttribute("key");
    const val = getValueByPath(data, key ?? "") ?? "";
    tag.replaceWith(val.toString());
  });
}

async function processLoopTags(
  root: HTMLElement,
  data: TemplateData,
  baseDir: string
) {
  const loopTags = root.querySelectorAll("loop");

  for (const loopTag of loopTags) {
    const arrayName = loopTag.getAttribute("data");
    const varName = loopTag.getAttribute("var");
    const indexName = loopTag.getAttribute("index");

    if (!arrayName || !varName || !indexName) continue;

    const array = data[arrayName];
    if (!Array.isArray(array)) {
      loopTag.remove();
      continue;
    }

    const renderedItems = await Promise.all(
      array.map(async (item: any, index: number) => {
        const loopContext = { ...data, [varName]: item, [indexName]: index };

        const rendered = await renderTemplate(
          loopTag.innerHTML,
          loopContext,
          baseDir
        );
        return rendered.toString();
      })
    );

    loopTag.replaceWith(renderedItems.join(""));
  }
}

async function processIfTags(
  root: HTMLElement,
  data: TemplateData,
  baseDir: string
) {
  const ifTags = root.querySelectorAll("if");

  for (const tag of ifTags) {
    const conditionExpr = tag.getAttribute("condition")?.trim();
    if (!conditionExpr) {
      tag.remove();
      continue;
    }

    let keep = false;
    try {
      const sandbox = { ...data };
      const context = vm.createContext(sandbox);
      const result = vm.runInContext(`(${conditionExpr})`, context);
      keep = Boolean(result);
    } catch (err) {
      console.warn("Error evaluating <if> condition:", conditionExpr, err);
    }

    if (keep) {
      const rendered = await renderTemplate(tag.innerHTML, data, baseDir);
      tag.replaceWith(rendered.toString());
    } else {
      tag.remove();
    }
  }
}

export async function renderFile(
  filePath: string,
  content: string,
  data: TemplateData
): Promise<string> {
  const fullPath = path.resolve(filePath);
  return await renderTemplate(content, data, path.dirname(fullPath));
}
