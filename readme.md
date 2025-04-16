# 🌐 rstic — Static Site Generator for Modern Developers

**rstic** is a blazing-fast, zero-config static site generator built with Node.js. It supports `.html` and `.ejs` templates, automatic file-based routing, and live reload powered by WebSockets. It's lightweight, pluggable, and perfect for developers who want fast iteration while building static websites.

---

## 🚀 Features

- ⚡ Instant live reload on file changes (HTML, EJS, JSON)
- 🧩 EJS template support with automatic JSON data injection
- 🔁 Automatic route generation based on file structure
- 🗃️ Custom HTML templating engine with `<value>`, `<loop>`, `<if>`, `<include>`
- 🔧 Configurable via `.rsticrc.*` or `rstic.config.*` using `cosmiconfig`
- 🧠 `.json` data file support for each template
- 📁 `public/` directory for static assets
- 🛠️ Developer-friendly CLI (`dev`, `build`, `start`)

---

## 📦 Installation

```bash
npm install --save-dev rstic
```

---

## 🔧 Usage

### Start Development Server with Live Reload

```bash
npx rstic dev
```

Starts the server on [http://localhost:3003](http://localhost:3003) with live reload for `.ejs`, `.html`, `.json`, and `.css`.

### Build for Production

```bash
npx rstic build
```

Generates static HTML files in the `dist/` directory based on the defined config.

### Serve Built Site

```bash
npx rstic start
```

Serves the built `dist/` directory with live preview.

---

## 🗂️ Folder Structure

```bash
project/
├── public/               # Static files (served directly)
├── src/
│   └── pages/
│       ├── index.ejs     # Renders at "/"
│       ├── about.html    # Renders at "/about"
│       ├── contact.ejs   # Renders at "/contact"
│       └── blog/
│           ├── post.ejs  # Renders at "/blog/post"
│           └── post.json # Injected into post.ejs
```

You can also use `pages/` in the root folder instead of `src/pages`.

---

## ⚙️ Configuration (Optional)

rstic uses `cosmiconfig` to allow flexible config loading:

Supported config filenames:

```
.rsticrc, .rsticrc.json, .rsticrc.yaml, .rsticrc.ts,
rstic.config.js, rstic.config.ts, etc.
```

Default config structure:

```ts
{
  pagesDir: "src/pages",
  outputDir: "dist",
  watchDirs: ["src"],
  watchFiles: [".html", ".ejs", ".css", ".js"],
  supportFiles: [".html", ".ejs"],
  publicDir: "public"
}
```

---

## 🧩 Template Engine Tags

rstic supports custom tags for powerful template logic:

### `<value key="path.to.value" />`

Injects a value from the data.

### `<loop data="items" var="item" index="i">...</loop>`

Repeats inner HTML for each item in the array.

### `<if condition="data.exists">...</if>`

Renders content only if the condition evaluates truthy.

### `<include src="./partials/header.html" />`

Includes other HTML files (use relative paths).

---

## 📚 CLI Commands

```bash
npx rstic --help
```

### Available commands:

- `dev`: Start Express dev server with live reload
- `build`: Build static HTML to the output folder
- `start`: Start static live server from build directory

---

## 🤝 Contributing

Pull requests are welcome! Open an issue first to discuss what you’d like to change.

Make sure to update tests as appropriate.
