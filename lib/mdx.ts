import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DocSection, DocItem } from './docs-data';

const CONTENT_PATH = path.join(process.cwd(), 'content');

export async function getAllDocs(lang: 'en' | 'ar' = 'en'): Promise<DocSection[]> {
  try {
    const langPath = path.join(CONTENT_PATH, lang);
    
    if (!fs.existsSync(langPath)) {
      console.warn(`Content path not found: ${langPath}`);
      return [];
    }

    const files = fs.readdirSync(langPath).filter(file => file.endsWith('.mdx'));
    
    const docs = files.map((file) => {
      try {
        const filePath = path.join(langPath, file);
        const source = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(source);
        
        return {
          id: data.id || file.replace('.mdx', ''),
          title: data.title || 'Untitled',
          category: data.category || 'general',
          icon: data.icon,
          order: data.order ?? 999,
          content: content,
          tags: data.tags || [],
          items: data.items || [],
          translations: data.translations
        } as DocSection;
      } catch (err) {
        console.error(`Error reading MDX file ${file}:`, err);
        return null;
      }
    }).filter((doc): doc is DocSection => doc !== null);

    return docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (err) {
    console.error(`Error in getAllDocs for lang ${lang}:`, err);
    return [];
  }
}

export async function getStaticPaths(): Promise<{ slug: string[] }[]> {
  const languages: ('en' | 'ar')[] = ['en', 'ar'];
  const paths: { slug: string[] }[] = [];

  // Landing pages
  paths.push({ slug: [] });
  paths.push({ slug: ['ar'] });
  paths.push({ slug: ['en'] });

  for (const lang of languages) {
    const sections = await getAllDocs(lang);
    for (const section of sections) {
      // Section pages: /[lang]/[sectionId]
      paths.push({ slug: [lang, section.id] });
      
      if (section.items) {
        for (const item of section.items) {
          // Item pages: /[lang]/[sectionId]/[itemId]
          paths.push({ slug: [lang, section.id, item.id] });
        }
      }
    }
  }

  return paths;
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
