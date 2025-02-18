# inkrip

**inkrip** is a web-based service that allows users to add recipient names to PDF receipts. Currently, it is optimized for Amazon invoices. This project is built entirely on the frontend using Svelte and Tailwind CSS, ensuring privacy and efficiency without requiring a backend.

## 🚀 Features
- Upload a PDF invoice (Amazon receipts supported)
- Add a recipient name to the invoice
- Download the modified PDF with the printed name
- Fully client-side (no server processing required)

## 🛠️ Tech Stack
- [SvelteKit](https://kit.svelte.dev/) – Reactive frontend framework
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first styling
- [PDF-lib](https://pdf-lib.js.org/) – PDF manipulation in JavaScript
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) – Saving PDFs locally

## 📦 Installation
To set up the project locally, use the following commands:

```bash
# Clone the repository
git clone https://github.com/yourusername/inkrip.git
cd inkrip

# Install dependencies
npm install
```

## 💻 Development
Run the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## 📦 Building for Production
To create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## ✨ How to Use
1. Open the inkrip web application.
2. Upload an Amazon PDF receipt.
3. Enter the recipient’s name in the input field.
4. Click "Generate" to embed the name in the PDF.
5. Download the modified invoice.

## 🔗 Deployment
Since this is a frontend-only application, it can be deployed on any static hosting provider, such as:
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)

## 📜 License
This project is licensed under the MIT License.

## 🤝 Contributing
Feel free to submit issues or pull requests to improve inkrip!

## 📬 Contact
For inquiries, reach out via GitHub issues or email: kakeru.kageshima@bootware.jp
