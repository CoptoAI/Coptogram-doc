# Coptogram Documentation Platform

A modern, high-performance documentation portal built with Next.js 15, optimized for spiritual education and multilingual support (English & Arabic).

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
3. **Open App**: Navigate to `http://localhost:3000`.

---

## ✍️ Content Management

All documentation content is managed centrally in **`lib/docs-data.ts`**. No database management is required for basic content updates.

### Adding a New Section
Add a new object to the `docs` array in `lib/docs-data.ts`:
```typescript
{
  id: 'my-section',
  title: 'My New Section',
  category: 'general', // 'organization' | 'student' | 'general'
  icon: 'Compass',     // Lucide icon name
  content: 'Introductory content...',
  items: []            // Array of sub-topics
}
```

### Adding a Documentation Item
Items go inside the `items` array of a section:
```typescript
{
  id: 'my-item',
  title: 'Tutorial Topic',
  description: 'Detailed explanation supporting **Markdown**.',
  details: ['Step 1', 'Step 2'], // Bullet points
  translations: {
    ar: {
      title: 'العنوان بالعربي',
      description: 'الوصف بالعربي'
    }
  }
}
```

### Changing Landing Page Hero Content
The landing page title and subtitle are managed in `components/DocsManager.tsx` within the `siteConfig` state:
```typescript
const [siteConfig] = React.useState({
  heroTitle: 'Your New Title',
  heroSubtitle: 'Your New Subtitle...',
  translations: {
    ar: {
      heroTitle: 'العنوان الجديد',
      heroSubtitle: 'الوصف الجديد...'
    }
  }
});
```

---

## 🌍 Multilingual Support (i18n)

The platform supports **English** and **Arabic** out of the box.
- To add Arabic content, fill the `translations.ar` object in your sections and items.
- The UI automatically handles Right-to-Left (RTL) layout and font switching when Arabic is selected.

---

## 🚢 Deployment to Hostinger (Shared Hosting)

Hostinger supports Next.js through its Node.js selector. Follow these steps for a successful deployment:

### 1. Build the Project
Run the following command to generate the standalone production build:
```bash
npm run build
```

### 2. Prepare Upload Files
Copy the contents of the generated `.next/standalone` folder to your computer. Then:
- Copy the `public` folder into the root.
- Copy `.next/static` into `.next/standalone/.next/static`.
- **CRITICAL**: Copy the `content` folder from your project root into your deployment root. The app needs this folder to render your documentation articles.

### 3. Upload to Hostinger
- Log in to **Hostinger hPanel**.
- Go to **File Manager** and upload all files (including `server.js`) to your application root (e.g., `public_html`).

### 4. Configure Node.js
- Search for **Node.js** in hPanel.
- Select **Node.js Version 20** or higher.
- Set **Application Startup File** to `server.js`.
- Add your environment variables (like `NEXT_PUBLIC_GA_ID`) in the hPanel Node.js settings.

### 5. Authorized Domains (Firebase)
If using Google Login, add your production domain in the **Firebase Console** under **Authentication > Settings > Authorized Domains**.

---

## 📝 Icons & UI Patterns
- **Icons**: Icons are powered by `lucide-react`. If adding a new icon, ensure it is mapped in `components/Sidebar.tsx`.
- **UI Alerts**: Use HTML in descriptions: `<div class='alert info'>...</div>`.
- **Typography**: The platform uses the **Cairo** font for superior multilingual readability.

---

*For detailed technical architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).*
