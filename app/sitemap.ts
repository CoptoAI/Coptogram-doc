import { MetadataRoute } from 'next';
import { docs } from '@/lib/docs-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ais-dev-ow2tvuurl3gfgq577uqwqk-490349773237.europe-west2.run.app';

  // Base pages
  const basePages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}?lang=ar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Section pages (English)
  const enSections = docs.map((doc) => ({
    url: `${baseUrl}?section=${doc.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Section pages (Arabic)
  const arSections = docs.map((doc) => ({
    url: `${baseUrl}?section=${doc.id}&lang=ar`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Item pages (English)
  const enItems = docs.flatMap((section) => 
    (section.items || []).map((item) => ({
      url: `${baseUrl}?section=${section.id}&item=${item.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  // Item pages (Arabic)
  const arItems = docs.flatMap((section) => 
    (section.items || []).map((item) => ({
      url: `${baseUrl}?section=${section.id}&item=${item.id}&lang=ar`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  return [...basePages, ...enSections, ...arSections, ...enItems, ...arItems];
}
