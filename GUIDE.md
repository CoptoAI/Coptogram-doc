# Coptogram Content Management Guide

This guide explains how to manage documentation sections and items within the Coptogram platform. All documentation content is centralized in a single data file for easy maintenance and localization.

## Core File: `lib/docs-data.ts`

The entire documentation structure, including sections, individual items, and their translations, is managed in `lib/docs-data.ts`.

---

## 1. Adding a New Section

To add a primary section to the documentation (visible in the Sidebar):

1. Open `lib/docs-data.ts`.
2. Locate the `docs` array.
3. Add a new object following the `DocSection` interface:

```typescript
{
  id: 'new-section-id', // Unique ID used for navigation
  title: 'Your Section Title',
  category: 'general', // 'organization', 'student', or 'general'
  icon: 'Compass', // Lucide icon name (see Icon Mapping below)
  content: 'Introductory markdown content for this section.',
  tags: ['Tag1', 'Tag2'], // Optional categorization tags
  translations: {
    ar: {
      title: 'عنوان القسم',
      content: 'محتوى مقدمة القسم باللغة العربية.',
      tags: ['وسم1']
    }
  },
  items: [] // List of sub-items (explained below)
}
```

---

## 2. Managing Documentation Items (Lessons/Sub-topics)

Each section has an `items` array. These appear in the Table of Contents (TOC) and the detailed body of the page.

### Adding an Item
Inside the `items` array of a section:

```typescript
{
  id: 'item-unique-id',
  title: 'Item Title',
  description: 'A brief description (supports Markdown).',
  details: [
    'Bullet point detail 1',
    'Bullet point detail 2'
  ],
  tags: ['FeatureX'],
  relatedLinks: [
    { title: 'Related Topic', sectionId: 'other-section', itemId: 'optional-item-id' }
  ],
  translations: {
    ar: {
      title: 'عنوان العنصر',
      description: 'وصف قصير للعنصر.',
      details: ['تفاصيل 1', 'تفاصيل 2']
    }
  }
}
```

### Editing/Deleting
- **To Edit**: Simply modify the values within the `docs` array.
- **To Delete**: Remove the object from the `items` array or delete the entire section from the `docs` array.

---

## 3. Icon Mapping

The sidebar automatically displays icons based on the `icon` field. If you use a new icon name:

1. Open `components/Sidebar.tsx`.
2. Import the new icon from `lucide-react`.
3. Add it to the `iconMap` object:

```typescript
const iconMap: Record<string, any> = {
  // Existing icons...
  NewIconName: NewIconImport, 
};
```

---

## 4. Rich Content & UI Patterns

You can use custom UI patterns inside the `content` or `description` fields using HTML/CSS classes:

### Alerts
```html
<div class='alert info'>Information Tip</div>
<div class='alert success'>Success Message</div>
<div class='alert warning'>Important Warning</div>
```

### Steps (Animated)
```html
<ol class='steps'>
  <li>First step content</li>
  <li>Second step content</li>
</ol>
```

### Quotes
```html
<blockquote class='s1'>
  "Wisdom statement here."
  <span>Author Name</span>
</blockquote>
```

---

## 5. Deployment & Persistence

Whenever you edit `lib/docs-data.ts`, the application will hot-reload the changes. No additional configuration is needed.

### Support
For complex layout changes beyond content, please refer to the following components:
- `components/DocContent.tsx` (Page layout and rendering)
- `components/Sidebar.tsx` (Navigation structure)
- `components/InteractiveSteps.tsx` (Within DocContent)
