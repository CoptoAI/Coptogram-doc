'use client';

import * as React from 'react';
import { DocSection } from '@/lib/docs-data';
import { CodeBlock } from './CodeBlock';
import { Breadcrumbs } from './Breadcrumbs';
import { Feedback } from './Feedback';
import { DocTOC } from './DocTOC';
import { motion } from 'motion/react';
import { ExternalLink, ChevronRight, ListIcon, AlertTriangle, RefreshCw, FileQuestion } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface DocContentProps {
  section: DocSection | null | undefined;
  onNavigate: (id: string) => void;
  language?: 'en' | 'ar';
  onLinkClick?: (sectionId: string, itemId?: string) => void;
  allDocs: DocSection[];
}

export function DocContent({ section, onNavigate, language = 'en', onLinkClick, allDocs }: DocContentProps) {
  // Error state for internal component failures
  const [hasError, setHasError] = React.useState(false);

  // If section is null, show a 404/Not Found state
  if (!section || hasError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6 text-destructive">
          <FileQuestion className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'ar' ? 'لم يتم العثور على القسم' : 'Documentation Section Not Found'}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {language === 'ar' 
            ? 'عذراً، يبدو أن القسم الذي تبحث عنه غير موجود أو تم نقله. يرجى العودة إلى الصفحة الرئيسية أو استخدام البحث.' 
            : "Oops! It looks like the section you're looking for doesn't exist or has been moved. Please return home or use the search."}
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <RefreshCw className="h-4 w-4" />
          {language === 'ar' ? 'العودة للرئيسية' : 'Return to Documentation Home'}
        </button>
      </motion.div>
    );
  }
  // Build a map of titles to their IDs for cross-linking
  const keywordMap = React.useMemo(() => {
    const map: Record<string, { sectionId: string; itemId?: string }> = {};
    
    allDocs.forEach(s => {
      // Index section titles
      const sTitle = language === 'ar' && s.translations?.ar ? s.translations.ar.title : s.title;
      if (sTitle) map[sTitle.toLowerCase()] = { sectionId: s.id };
      
      // Index item titles
      s.items?.forEach(item => {
        const iTitle = language === 'ar' && item.translations?.ar ? item.translations.ar.title : item.title;
        if (iTitle) map[iTitle.toLowerCase()] = { sectionId: s.id, itemId: item.id };
      });
    });
    
    return map;
  }, [allDocs, language]);

  // Helper to inject links into text
  const linkify = (text: string) => {
    if (!text) return text;
    
    // Sort keywords by length descending to match longest phrases first
    const keywords = Object.keys(keywordMap).sort((a, b) => b.length - a.length);
    if (keywords.length === 0) return text;

    let result = text;
    const placeholderMap: Record<string, string> = {};
    let counter = 0;

    // Use a regex to find keywords, avoiding matching inside existing markdown links or codes
    keywords.forEach(keyword => {
      // Escape keyword for regex
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Look for the keyword as a whole word, case insensitive
      // Not preceded by [ or ( (basic check to avoid breaking links)
      const regex = new RegExp(`(?<![\\[\\(])\\b${escapedKeyword}\\b(?![\\]\\)])`, 'gi');
      
      result = result.replace(regex, (match) => {
        const id = `__LINK_${counter}__`;
        const linkData = keywordMap[keyword.toLowerCase()];
        const url = linkData.itemId 
          ? `docs://${linkData.sectionId}/${linkData.itemId}` 
          : `docs://${linkData.sectionId}`;
        
        placeholderMap[id] = `[${match}](${url})`;
        counter++;
        return id;
      });
    });

    // Replace placeholders back
    Object.keys(placeholderMap).forEach(id => {
      result = result.replace(id, placeholderMap[id]);
    });

    return result;
  };

  const breadcrumbItems = [
    { label: language === 'ar' ? 'التوثيق' : 'Documentation', onClick: () => onNavigate('home') },
    { label: section.title, active: true }
  ];

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
    }
    return url;
  };

  const MarkdownComponents = {
    a: ({ href, children, ...props }: any) => {
      if (href?.startsWith('docs://')) {
        const path = href.replace('docs://', '').split('/');
        const sectionId = path[0];
        const itemId = path[1];
        
        return (
          <button
            onClick={() => onLinkClick?.(sectionId, itemId)}
            className="text-primary hover:underline font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm px-0.5 transition-all active:opacity-70"
          >
            {children}
          </button>
        );
      }
      return (
        <a 
          href={href} 
          {...props} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm px-0.5 inline-flex items-center gap-1 active:scale-[0.98]"
        >
          {children}
        </a>
      );
    },
    iframe: ({ src, title, ...props }: any) => {
      const [iframeError, setIframeError] = React.useState(false);
      const isYouTube = src?.includes('youtube.com') || src?.includes('youtu.be');
      
      let finalSrc = src;
      try {
        finalSrc = isYouTube ? getYouTubeEmbedUrl(src) : src;
      } catch (e) {
        console.error("Failed to parse YouTube URL:", e);
      }
      
      if (iframeError) {
        return (
          <div className="flex flex-col items-center justify-center aspect-video w-full my-8 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">
              {language === 'ar' ? 'فشل تحميل المحتوى الخارجي' : 'External content failed to load'}
            </p>
            <a href={src} target="_blank" rel="noopener noreferrer" className="mt-4 text-[12px] text-primary hover:underline">
               {language === 'ar' ? 'افتح في نافذة جديدة' : 'Open in a new window'}
            </a>
          </div>
        );
      }

      return (
        <div className="relative aspect-video w-full my-8 overflow-hidden rounded-xl border border-border bg-muted/20 shadow-sm">
          <iframe
            src={finalSrc}
            title={title || "Video Player"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setIframeError(true)}
            {...props}
          />
        </div>
      );
    },
    video: ({ src, ...props }: any) => {
      const [videoError, setVideoError] = React.useState(false);

      if (videoError) {
        return (
          <div className="flex flex-col items-center justify-center py-10 my-8 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
             <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
             <p className="text-sm font-medium">{language === 'ar' ? 'فشل تشغيل الفيديو' : 'Video playback failed'}</p>
          </div>
        );
      }

      return (
        <div className="my-8 overflow-hidden rounded-xl border border-border bg-black shadow-lg">
          <video 
            src={src} 
            controls 
            className="w-full"
            playsInline
            onError={() => setVideoError(true)}
            {...props}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
  };

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl px-4 py-8 lg:px-8"
    >
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <h1 className="text-[32px] font-bold tracking-tight text-foreground mb-3">
        {section.title}
      </h1>

      <div className="markdown-body prose dark:prose-invert max-w-none text-muted-foreground mb-8 text-start">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={MarkdownComponents}
        >
          {linkify(section.content)}
        </ReactMarkdown>
      </div>

      <DocTOC items={section.items || []} language={language} />

      <div className="space-y-10">
        <div className="bg-primary/[0.05] border border-primary/20 border-s-4 border-s-primary rounded-md p-4 mb-8 text-[13px] text-foreground/90 text-start">
          <strong>{language === 'ar' ? 'ملاحظة:' : 'Note:'}</strong> {language === 'ar' 
            ? 'هذا تخطيط مستندات عالي الكثافة. استخدم الشريط الجانبي للتنقل عبر الوحدات الأساسية لنظام كوبتوجرام.' 
            : 'This is a high-density documentation layout. Use the sidebar to navigate through the core modules of the Coptogram system.'}
        </div>

        {section.items?.map((item) => (
          <div key={item.id} className="scroll-mt-20 pt-2" id={item.id}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold tracking-tight">
                {item.title}
              </h2>
              {item.version && (
                <span className="inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-tighter">
                  {item.version}
                </span>
              )}
            </div>

            <div className="markdown-body prose dark:prose-invert max-w-none text-[14px] text-muted-foreground mb-4 text-start">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={MarkdownComponents}
              >
                {linkify(item.description)}
              </ReactMarkdown>
            </div>

            {item.details && (
              <ul className="mb-6 space-y-1.5 list-none text-[13px] text-muted-foreground">
                {item.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-foreground/80 leading-normal text-start">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        components={MarkdownComponents}
                      >
                        {linkify(detail)}
                      </ReactMarkdown>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {item.code && (
              <div className="mt-4">
                <CodeBlock code={item.code} />
              </div>
            )}

            {item.relatedLinks && item.relatedLinks.length > 0 && (
              <div className="mt-8 p-5 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 opacity-70">
                  <ListIcon className="h-3 w-3" />
                  {language === 'ar' ? 'استكشف المزيد' : 'Explore Further'}
                </div>
                <div className="flex flex-wrap gap-3">
                  {item.relatedLinks.map((link, lIdx) => {
                    const localizedTitle = (language === 'ar' && item.translations?.ar?.relatedLinks?.[lIdx]) 
                      ? item.translations.ar.relatedLinks[lIdx].title 
                      : link.title;
                    
                    return (
                      <motion.button
                        key={lIdx}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onLinkClick?.(link.sectionId, link.itemId)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-[13px] font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm hover:shadow-md group"
                      >
                        {localizedTitle}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Feedback />

      <footer className="mt-20 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            className="hover:text-primary flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md px-2 py-1 -mx-2 hover:bg-primary/5 active:scale-95"
          >
            Edit this page <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <span className="hidden sm:inline opacity-30 select-none">|</span>
          <span>Updated April 2026</span>
        </div>
        <div className="text-center sm:text-end opacity-80">
          © 2026 Coptogram Platform. All rights reserved.
        </div>
      </footer>
    </motion.div>
  );
}
