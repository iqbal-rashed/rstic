# 🌐 rstic

**rstic** is a blazing-fast, zero-config static site generator built with Node.js. It supports `.html` and `.ejs` templates, offers automatic file-based routing, and comes with **live reload** powered by WebSockets. Perfect for developers who want fast iteration while building static websites.

---

## 🚀 Features

- ⚡ Instant live reload on file changes (HTML, EJS, JSON)
- 🧩 EJS template support with data injection
- 🔁 Automatic route generation based on file structure
- 📁 `public/` directory for static assets
- 🧠 `.json` data file support for each template
- 🛠️ Developer-friendly CLI

---

## 📦 Installation

You can install rstic with:

```bash
npm install --save-dev rstic
```

---

## 🔧 Usage

### Start the development server:

```bash
npx rstic dev
```

By default, this runs the server at [http://localhost:3003](http://localhost:3003)

### Folder structure

rstic automatically detects the `pages` directory:

```bash
project/
├── public/               # Static files served directly
├── src/
│   └── pages/
│       ├── index.ejs     # Renders at "/"
│       ├── about.html    # Renders at "/about"
│       ├── contact.ejs   # Renders at "/contact"
│       └── blog/
│           └── post.ejs  # Renders at "/blog/post"
│           └── post.json # Optional JSON data injected into post.ejs
```

You can also place `pages/` directly in the root instead of `src/pages`.

---

## ✨ Template Features

- `.ejs` and `.html` files are treated as templates.
- `.json` file with the same name as the template (e.g., `about.json` for `about.ejs`) will be automatically loaded and injected as data.
- `_` prefixed templates are ignored (e.g., `_layout.ejs`).

## 📚 CLI Help (coming soon)

```bash
rstic --help
```

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
