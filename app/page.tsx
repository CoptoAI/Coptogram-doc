import * as React from 'react';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getUnifiedDocs, getDocById } from '@/lib/mdx';
import { DocsManager } from '@/components/DocsManager';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/lib/mdx-components';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const sectionId = resolvedParams.section as string;
  const itemId = resolvedParams.item as string;
  const lang = (resolvedParams.lang as string) === 'ar' ? 'ar' : 'en';
  const isArabic = lang === 'ar';
  
  const docs = await getUnifiedDocs();

  const baseTitle = isArabic ? 'توثيق كوبتوجرام' : 'Coptogram Documentation';
  const baseDescription = isArabic 
    ? 'الدليل الكامل لمنصة كوبتوجرام - تعلم كيفية إدارة خدمتك والنمو روحياً.' 
    : 'The complete guide to the Coptogram Platform - learn how to manage your ministry and grow spiritually.';

  if (!sectionId) {
    return {
      title: baseTitle,
      description: baseDescription,
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

  // Enhance if item is present
  if (itemId && section.items) {
    const item = section.items.find(i => i.id === itemId);
    if (item) {
      title = isArabic && item.translations?.ar ? item.translations.ar.title : item.title;
      const baseDesc = isArabic && item.translations?.ar ? item.translations.ar.description : item.description;
      const details = isArabic && item.translations?.ar ? item.translations.ar.details : item.details;
      
      // Combine description with details for a richer SEO snippet
      description = baseDesc;
      if (details && details.length > 0) {
        description += ` - ${details.join(' ')}`;
      }
    }
  }

  // Sanitize: Remove Markdown syntax and limit length
  const finalDescription = description
    .replace(/[#*`~_]/g, '') // Remove MD formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Standardize MD links to plain text
    .substring(0, 160)
    .trim();

  return {
    title: `${title} | ${baseTitle}`,
    description: `${finalDescription}...`,
    keywords: ['Coptogram', 'Church Management', 'Digital Ministry', title, section.title].join(', '),
    openGraph: {
      title: `${title} | Coptogram Docs`,
      description: finalDescription,
      type: 'article',
      locale: isArabic ? 'ar_EG' : 'en_US',
    }
  };
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const sectionId = (resolvedParams.section as string) || 'overview';
  const lang = (resolvedParams.lang as string) === 'ar' ? 'ar' : 'en';

  const [docs, activeSection] = await Promise.all([
    getUnifiedDocs(),
    getDocById(sectionId, lang)
  ]);
  
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading Coptogram Docs...</div>}>
      <DocsManager docs={docs}>
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
