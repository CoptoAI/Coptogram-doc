import * as React from 'react';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getUnifiedDocs, getDocById, getStaticPaths } from '@/lib/mdx';
import { DocsManager } from '@/components/DocsManager';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/lib/mdx-components';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  return await getStaticPaths();
}

function parseSlug(slug?: string[]): { lang: 'en' | 'ar'; sectionId?: string; itemId?: string } {
  if (!slug || slug.length === 0) return { lang: 'en', sectionId: undefined, itemId: undefined };
  
  let lang: 'en' | 'ar' = 'en';
  let sectionId: string | undefined = undefined;
  let itemId: string | undefined = undefined;

  // First segment could be lang or sectionId (if lang is defaulted)
  if (slug[0] === 'ar' || slug[0] === 'en') {
    lang = slug[0] as 'en' | 'ar';
    sectionId = slug[1];
    itemId = slug[2];
  } else {
    // Default to 'en' if first segment isn't a known lang
    sectionId = slug[0];
    itemId = slug[1];
  }

  return { lang, sectionId, itemId };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { lang, sectionId, itemId } = parseSlug(slug);
  const isArabic = lang === 'ar';
  
  const docs = await getUnifiedDocs();

  const baseTitle = isArabic ? 'كوبتوجرام | المركز التعليمي' : 'Coptogram | Learning Center';
  const baseDescription = isArabic 
    ? 'اكتشف كيف يمكنك إدارة خدمتك بكفاءة والنمو روحياً من خلال توثيق منصة كوبتوجرام الشامل.' 
    : 'Discover how to manage your ministry efficiently and grow spiritually with the comprehensive Coptogram Platform documentation.';

  const localizedKeywords = isArabic 
    ? ['كوبتوجرام', 'إدارة الكنيسة', 'خدمة رقمية', 'أرثوذكس', 'توثيق', 'دليل', 'تعلم']
    : ['Coptogram', 'Church Management', 'Digital Ministry', 'Orthodox', 'Documentation', 'Guide', 'Learn'];

  if (!sectionId) {
    return {
      title: baseTitle,
      description: baseDescription,
      keywords: localizedKeywords.join(', '),
    };
  }

  const section = docs.find(s => s.id === sectionId);
  if (!section) {
    return {
      title: `Not Found | ${baseTitle}`,
      description: baseDescription,
    };
  }

  let title = isArabic && section.translations?.ar ? section.translations.ar.title : section.title;
  let description = isArabic && section.translations?.ar 
    ? section.translations.ar.content 
    : section.content;

  if (itemId && section.items) {
    const item = section.items.find(i => i.id === itemId);
    if (item) {
      title = isArabic && item.translations?.ar ? item.translations.ar.title : item.title;
      const baseDesc = isArabic && item.translations?.ar ? item.translations.ar.description : item.description;
      const details = isArabic && item.translations?.ar ? item.translations.ar.details : item.details;
      
      description = baseDesc;
      if (details && details.length > 0) {
        description += ` - ${details.join(' ')}`;
      }
    }
  }

  const finalDescription = description
    .replace(/[#*`~_]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .substring(0, 160)
    .trim();

  return {
    title: `${title} | ${baseTitle}`,
    description: finalDescription,
    keywords: [...localizedKeywords, title, section.title].join(', '),
    openGraph: {
      title: `${title} | Coptogram Docs`,
      description: finalDescription,
      type: 'article',
      locale: isArabic ? 'ar_EG' : 'en_US',
    }
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const { lang, sectionId, itemId } = parseSlug(slug);

  const [docs, activeSection] = await Promise.all([
    getUnifiedDocs(),
    sectionId ? getDocById(sectionId, lang) : Promise.resolve(undefined)
  ]);
  
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading Coptogram Docs...</div>}>
      <DocsManager 
        docs={docs} 
        initialLang={lang}
        initialSectionId={sectionId}
        initialItemId={itemId}
      >
        {activeSection && (
          <MDXRemote 
            source={activeSection.content} 
            components={mdxComponents} 
          />
        )}
      </DocsManager>
    </Suspense>
  );
}
