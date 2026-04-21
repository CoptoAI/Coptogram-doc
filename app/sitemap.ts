import { MetadataRoute } from 'next';
import { docs } from '@/lib/docs-data';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://docs.coptogram.com'; // Use a generic production URL

  // Base pages
  const basePages = [
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/ar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Section pages
  const sections = docs.flatMap((doc) => [
    {
      url: `${baseUrl}/en/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ar/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]);

  // Item pages
  const items = docs.flatMap((section) => 
    (section.items || []).flatMap((item) => [
      {
        url: `${baseUrl}/en/${section.id}/${item.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/ar/${section.id}/${item.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }
    ])
  );

  return [...basePages, ...sections, ...items];
}
