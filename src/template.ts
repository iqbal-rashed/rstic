import fs from 'fs/promises';
import path from 'path';
import { parse, HTMLElement } from 'node-html-parser';

export interface TemplateData {
  [key: string]: any;
}

function getValueByPath(obj: any, pathStr: string): any {
  return pathStr.split('.').reduce((acc, key) => acc?.[key], obj);
}

function processValueTags(root: HTMLElement, data: TemplateData): void {
  const valueTags = root.querySelectorAll('value');
  valueTags.forEach((tag) => {
    const key = tag.getAttribute('key');
    const val = getValueByPath(data, key ?? '') ?? '';
    tag.replaceWith(val.toString());
  });
}

async function processLoopTags(
  root: HTMLElement,
  data: TemplateData,
  baseDir: string
) {
  const loopTags = root.querySelectorAll('loop');

  for (const loopTag of loopTags) {
    const arrayName = loopTag.getAttribute('data');
    const varName = loopTag.getAttribute('var');
    const indexName = loopTag.getAttribute('index');

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

    loopTag.replaceWith(renderedItems.join(''));
  }
}

async function processIfTags(
  root: HTMLElement,
  data: TemplateData,
  baseDir: string
) {
  const ifTags = root.querySelectorAll('if');

  for (const tag of ifTags) {
    const condition = tag.getAttribute('condition');
    if (!condition) {
      tag.remove();
      continue;
    }

    const value = getValueByPath(data, condition);
    if (value) {
      const rendered = await renderTemplate(tag.innerHTML, data, baseDir);
      tag.replaceWith(rendered.toString());
    } else {
      tag.remove();
    }
  }
}

async function processIncludeTags(
  root: HTMLElement,
  data: TemplateData,
  baseDir: string
) {
  const includeTags = root.querySelectorAll('include');

  for (const tag of includeTags) {
    const includePath = tag.getAttribute('path');
    if (!includePath) continue;

    const fullPath = path.resolve(baseDir, includePath + '.html');
    const content = await fs.readFile(fullPath, 'utf8');
    const rendered = await renderTemplate(
      content,
      data,
      path.dirname(fullPath)
    );
    tag.replaceWith(parse(rendered));
  }
}

async function renderTemplate(
  template: string,
  data: TemplateData,
  baseDir: string
): Promise<string> {
  const root = parse(template, { comment: true });

  await processIncludeTags(root, data, baseDir);
  await processIfTags(root, data, baseDir);
  await processLoopTags(root, data, baseDir);
  await processValueTags(root, data);

  return root.toString();
}

export async function renderFile(
  filePath: string,
  content: string,
  data: TemplateData
): Promise<string> {
  const fullPath = path.resolve(filePath);
  return await renderTemplate(content, data, path.dirname(fullPath));
}
