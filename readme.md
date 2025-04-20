**rstic** is a blazing-fast, zero-config static site generator built with Node.js. It supports `.html` and `.ejs` templates, automatic file-based routing, and live reload powered by WebSockets. It's lightweight, pluggable, and perfect for developers who want fast iteration while building static websites.

---

## 🚀 Features

- ⚡ Instant live reload on file changes (HTML, EJS, JSON)
- 🧩 EJS template support with automatic JSON data injection
- 🔁 Automatic route generation based on file structure
- 🗃️ Custom HTML templating engine with `<value>`, `<loop>`, `<if>`, `<include>`, and inline expressions
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
  publicDir: "public",
  build: "server", // server or static
  port: 3003,
}
```

---

## 🧩 Template Engine

rstic includes a custom HTML templating engine that processes your templates in two phases:

1. **Tag-based rendering**: Handles `<include>`, `<loop>`, `<if>`, and `<value>` tags.
2. **Inline expressions**: Evaluates JavaScript expressions inside `{{ }}` placeholders.

### Supported Tags

#### 1. Inline Expressions: `{{ expression }}`

Evaluate any valid JavaScript expression against the provided data context.

```html
<p>Hello, {{ user.name.toUpperCase() }}!</p>
<!-- If data = { user: { name: 'Alice' } }, renders as: -->
<p>Hello, ALICE!</p>
```

Expressions run in a secure `vm` sandbox, and errors yield empty strings with a console warning.

#### 2. Value Tag: `<value key="path.to.value" />`

Injects a data property by key path (dot-separated).

```html
<value key="site.title" />
<!-- If data = { site: { title: 'My Blog' } }, renders as: -->
My Blog
```

#### 3. Loop Tag: `<loop data="items" var="item" index="i">...</loop>`

Iterates over an array in data, rendering the inner HTML for each element.

- `data`: key in the root data that points to an array.
- `var`: variable name for the current item in the loop.
- `index`: variable name for the current index.

```html
<loop data="posts" var="post" index="idx">
  <h2>{{ post.title }}</h2>
  <p>Post #{{ idx + 1 }}: {{ post.excerpt }}</p>
</loop>
```

Given `data = { posts: [ { title: 'Hello', excerpt: '...' }, ... ] }`, renders one block per post.

#### 4. If Tag: `<if condition="expression">...</if>`

Conditionally includes content if the expression (JavaScript) evaluates truthy.

```html
<if condition="user.isAdmin">
  <p>Welcome, administrator!</p>
</if>
```

The `condition` is evaluated in the same sandbox as inline expressions. If false or error, the tag is removed.

#### 5. Include Tag: `<include src="path/to/file.html" [attr="value"] />`

Embeds another template file, rendering it with the current data plus any additional attributes passed in.

- `src`: path to the partial, relative to the current template’s directory.
- Additional attributes are processed as inline expressions and merged into the include’s data context.

```html
<include src="./partials/header.html" title="{{ site.title }}" />
```

This will read and render `partials/header.html` with `data` extended by `{ title: data.site.title }`.

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
