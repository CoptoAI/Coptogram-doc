import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DocSection, DocItem } from './docs-data';

const CONTENT_PATH = path.join(process.cwd(), 'content');

export async function getAllDocs(lang: 'en' | 'ar' = 'en'): Promise<DocSection[]> {
  const langPath = path.join(CONTENT_PATH, lang);
  
  if (!fs.existsSync(langPath)) {
    return [];
  }

  const files = fs.readdirSync(langPath).filter(file => file.endsWith('.mdx'));
  
  const docs = files.map((file) => {
    const filePath = path.join(langPath, file);
    const source = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(source);
    
    // We need to match the DocSection interface
    return {
      id: data.id || file.replace('.mdx', ''),
      title: data.title,
      category: data.category || 'general',
      icon: data.icon,
      order: data.order ?? 999,
      content: content,
      tags: data.tags || [],
      // For now we'll support nested items if they are in the frontmatter
      // But in a real MDX architecture, items might also be separate files or sections
      items: data.items || [],
      translations: data.translations // Handle existing translations if any
    } as DocSection;
  });

  return docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getDocById(id: string, lang: 'en' | 'ar' = 'en'): Promise<DocSection | undefined> {
  const docs = await getAllDocs(lang);
  return docs.find(doc => doc.id === id);
}

// Helper to get unified data for DocsManager which currently handles translations in-memory
export async function getUnifiedDocs(): Promise<DocSection[]> {
  const enDocs = await getAllDocs('en');
  const arDocs = await getAllDocs('ar');

  return enDocs.map(enDoc => {
    const arDoc = arDocs.find(ar => ar.id === enDoc.id);
    if (arDoc) {
      return {
        ...enDoc,
        translations: {
          ar: {
            title: arDoc.title,
            content: arDoc.content,
            tags: arDoc.tags
          }
        },
        // Also sync items translations if they exist
        items: enDoc.items?.map(enItem => {
          const arItem = arDoc.items?.find(arI => arI.id === enItem.id);
          if (arItem) {
            return {
              ...enItem,
              translations: {
                ar: {
                  title: arItem.title,
                  description: arItem.description,
                  details: arItem.details,
                  tags: arItem.tags
                }
              }
            };
          }
          return enItem;
        })
      };
    }
    return enDoc;
  });
}
