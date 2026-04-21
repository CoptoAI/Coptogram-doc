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

## 🚢 Deployment to Hostinger (Manual & GitHub)

The project includes a **Root `server.js`** acting as the entry point for shared hosting.

### Method A: Direct GitHub Deployment (Recommended)
1. Connect your repo in Hostinger hPanel.
2. Set **Application Startup File** to `server.js`.
3. Set **Node.js Version** to 20.x or higher.
4. Add `NEXT_TELEMETRY_DISABLED=1` to Environment Variables.

### Method B: Manual Upload
1. Run `npm run build` locally.
2. Prepare files from `.next/standalone`.
3. **CRITICAL**: Copy the `content`, `public`, and `.next/static` folders into the root.
4. Upload all files (including `server.js`) to `public_html`.

### 🛡️ Fixing 503 Service Unavailable / EEXIST Error
If the server crashes:
1. Go to **Hostinger hPanel > Node.js**.
2. Click **Stop** on your app.
3. Wait 10 seconds, then click **Start**. 
*This clears "zombie" processes that lock the server ports.*

---

## 📝 Icons & UI Patterns
- **Icons**: Icons are powered by `lucide-react`. If adding a new icon, ensure it is mapped in `components/Sidebar.tsx`.
- **UI Alerts**: Use HTML in descriptions: `<div class='alert info'>...</div>`.
- **Typography**: The platform uses the **Cairo** font for superior multilingual readability.

---

*For detailed technical architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).*
