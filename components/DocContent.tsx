'use client';

import * as React from 'react';
import { DocSection } from '@/lib/docs-data';
import { CodeBlock } from './CodeBlock';
import { Breadcrumbs } from './Breadcrumbs';
import { Feedback } from './Feedback';
import { DocTOC } from './DocTOC';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  ChevronRight,
  ChevronLeft,
  List, 
  AlertTriangle, 
  RefreshCw, 
  FileQuestion, 
  ArrowRight,
  Download,
  PlayCircle,
  Info,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';
import { sanitizeSchema } from '@/lib/markdown-config';

interface DocContentProps {
  section: DocSection | null | undefined;
  onNavigate: (id: string) => void;
  language?: 'en' | 'ar';
  onLinkClick?: (sectionId: string, itemId?: string) => void;
  allDocs: DocSection[];
  activeItemId?: string | null;
}

export function DocContent({ 
  section, 
  onNavigate, 
  language = 'en', 
  onLinkClick, 
  allDocs,
  activeItemId 
}: DocContentProps) {
  // 1. ALL HOOKS AT THE TOP LEVEL
  
  // Error state for internal component failures
  const [hasError, setHasError] = React.useState(false);

  // Build a map of titles to their IDs for cross-linking
  const keywordMap = React.useMemo(() => {
    const map: Record<string, { sectionId: string; itemId?: string }> = {};
    
    if (!allDocs) return map;

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

  const breadcrumbItems = React.useMemo(() => {
    if (!section) return [];
    
    const items: any[] = [
      { label: language === 'ar' ? 'التوثيق' : 'Documentation', onClick: () => onNavigate('home') },
    ];

    // Current Section
    items.push({ 
      label: (language === 'ar' && section.translations?.ar) ? section.translations.ar.title : section.title, 
      active: !activeItemId,
      ...(activeItemId ? { onClick: () => onNavigate(section.id) } : {})
    });

    // Current Item if active
    if (activeItemId && section.items) {
      const activeItem = section.items.find(i => i.id === activeItemId);
      if (activeItem) {
        items.push({ 
          label: (language === 'ar' && activeItem.translations?.ar) ? activeItem.translations.ar.title : activeItem.title, 
          active: true 
        });
      }
    }

    return items;
  }, [section, activeItemId, language, onNavigate]);

  const { prevSection, nextSection } = React.useMemo(() => {
    if (!allDocs || !section) return { prevSection: null, nextSection: null };
    const currentIndex = allDocs.findIndex(s => s.id === section.id);
    if (currentIndex === -1) return { prevSection: null, nextSection: null };

    return {
      prevSection: currentIndex > 0 ? allDocs[currentIndex - 1] : null,
      nextSection: currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null
    };
  }, [allDocs, section]);

  // 2. EARLY RETURN AFTER HOOKS
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

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
    }
    return url;
  };

  const CustomIframe = ({ src, title, ...props }: any) => {
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
  };

  const CustomVideo = ({ src, ...props }: any) => {
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
  };

  const InteractiveSteps = ({ children, language }: any) => {
    const [activeStep, setActiveStep] = React.useState(1);
    const containerRef = React.useRef<HTMLOListElement>(null);
    const totalSteps = React.Children.toArray(children).filter(child => React.isValidElement(child)).length;

    const progressPercentage = totalSteps > 1 ? ((activeStep - 1) / (totalSteps - 1)) * 100 : 100;

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const stepIndex = parseInt(entry.target.getAttribute('data-step') || '1');
              setActiveStep(stepIndex);
            }
          });
        },
        { 
          threshold: 0.5, 
          rootMargin: '-10% 0px -40% 0px' 
        }
      );

      const steps = containerRef.current?.querySelectorAll('li[data-step]');
      steps?.forEach((step) => observer.observe(step));

      return () => observer.disconnect();
    }, [children]);

    return (
      <div className="relative group/steps-container my-16">
        {/* Floating Step Indicator */}
        <div className="sticky top-20 z-40 flex justify-end pointer-events-none mb-[-48px] px-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: totalSteps > 0 ? 1 : 0, 
              y: 0 
            }}
            className="bg-card/90 backdrop-blur-xl border border-border/50 text-foreground px-4 py-2.5 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[140px]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  {language === 'ar' ? 'التقدم' : 'Progress'}
                </span>
              </div>
              <span className="text-[11px] font-bold font-mono">
                {activeStep}/{totalSteps}
              </span>
            </div>
            
            {/* Progress Bar in Pill */}
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${(activeStep / totalSteps) * 100}%` }}
                className="h-full bg-primary"
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>
          </motion.div>
        </div>

        <ol 
          ref={containerRef}
          className="relative space-y-12"
        >
          {/* Vertical Progress Line Background */}
          <div className="absolute left-[19px] inset-y-0 w-1 bg-muted rounded-full overflow-hidden">
            {/* Dynamic Progress Fill */}
            <motion.div 
              animate={{ height: `${progressPercentage}%` }}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primary to-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>

          {React.Children.map(children, (child: any, idx) => {
            if (!React.isValidElement(child)) return null;
            const content = (child.props as any)?.children;
            const stepNum = idx + 1;

            return (
              <motion.li 
                key={idx} 
                data-step={stepNum}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={cn(
                  "relative pl-12 group/step transition-all duration-700",
                  activeStep === stepNum ? "opacity-100 scale-100" : "opacity-30 scale-[0.98] blur-[0.5px]"
                )}
              >
                <div 
                  className={cn(
                    "absolute left-0 top-0 h-10 w-10 rounded-full flex items-center justify-center font-black shadow-lg z-10 transition-all duration-500",
                    activeStep === stepNum 
                      ? "bg-primary text-primary-foreground scale-110 shadow-primary/40 ring-4 ring-primary/10" 
                      : (activeStep > stepNum ? "bg-primary/20 text-primary scale-95" : "bg-muted text-muted-foreground scale-100")
                  )}
                >
                  {activeStep > stepNum ? <CheckCircle2 className="h-5 w-5" /> : stepNum}
                </div>
                <div className={cn(
                   "space-y-2 p-6 rounded-2xl border transition-all duration-500",
                   activeStep === stepNum ? "bg-card border-border shadow-sm" : "border-transparent"
                )}>
                  <h3 className={cn(
                    "font-bold text-lg transition-colors duration-500 flex items-center gap-3",
                    activeStep === stepNum ? "text-primary" : "text-foreground"
                  )}>
                    {language === 'ar' ? `الخطوة ${stepNum}` : `Step ${stepNum}`}
                    {activeStep === stepNum && (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter"
                      >
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </motion.span>
                    )}
                  </h3>
                  <div className="text-muted-foreground leading-relaxed">
                    {content}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    );
  };

  const MarkdownComponents = {
    a: ({ href, children, className, ...props }: any) => {
      // 1. Internal Platform Links (docs://)
      if (href?.startsWith('docs://')) {
        const path = href.replace('docs://', '').split('/');
        const sectionId = path[0];
        const itemId = path[1];
        
        // If it's styled as a button, use button styles
        if (className?.includes('button')) {
          const isOutlined = className.includes('ln');
          return (
            <button
              onClick={() => onLinkClick?.(sectionId, itemId)}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95 my-4 cursor-pointer",
                isOutlined 
                  ? "border-2 border-primary text-primary hover:bg-primary/5" 
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
              )}
            >
              {children}
            </button>
          );
        }

        return (
          <button
            onClick={() => onLinkClick?.(sectionId, itemId)}
            className="text-primary hover:underline font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm px-0.5 transition-all active:opacity-70 inline-flex items-center gap-1"
            aria-label={`Navigate to ${children}`}
          >
            {children}
          </button>
        );
      }

      // 2. Custom Button Styles (from user XML guide)
      if (className?.includes('button')) {
        const isOutlined = className.includes('ln');
        const isDemo = className.includes('demo') || href?.includes('watch') || href?.includes('demo');
        const isDownload = className.includes('dl') || href?.includes('download');

        return (
          <a
            href={href}
            target="_blank"
            rel="nofollow noreferrer noopener"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95 my-4",
              isOutlined 
                ? "border-2 border-primary text-primary hover:bg-primary/5" 
                : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
            )}
            {...props}
          >
             {children}
             {isDownload && <Download className="h-4 w-4" />}
             {isDemo && <PlayCircle className="h-4 w-4" />}
          </a>
        );
      }

      // 3. External Links (extL)
      const isExternal = !href?.startsWith('#') && !href?.startsWith('/');
      return (
        <a 
          href={href} 
          {...props} 
          target={isExternal ? "_blank" : undefined} 
          rel={isExternal ? "nofollow noreferrer noopener" : undefined}
          className={cn(
            "text-primary hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm px-0.5 inline-flex items-center gap-1 active:scale-[0.98]",
            className?.includes('extL') && "font-semibold border-b border-primary/30"
          )}
        >
          {children}
          {isExternal && <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />}
        </a>
      );
    },
    blockquote: ({ children, className }: any) => {
      const isS1 = className?.includes('s1');
      const isS2 = className?.includes('s2');
      
      return (
        <blockquote className={cn(
          "relative my-10 p-8 rounded-2xl border-l-4 border-primary bg-muted/30 italic text-lg leading-relaxed text-foreground/90",
          isS1 && "bg-primary/5 border-l-8 border-primary/40 rounded-e-3xl",
          isS2 && "border-l-0 border-t-4 border-primary bg-background shadow-xl scale-105 my-14"
        )}>
          <div className="relative z-10">{children}</div>
          <span className="absolute -top-4 -left-2 text-6xl text-primary/10 select-none font-serif">&ldquo;</span>
        </blockquote>
      );
    },
    p: ({ children, className, ...props }: any) => {
      if (className?.includes('note')) {
        const isWarning = className.includes('wr');
        return (
          <div className={cn(
            "my-8 p-5 rounded-xl border-l-4 flex items-start gap-4",
            isWarning 
              ? "bg-amber-500/5 border-amber-500 text-amber-900 dark:text-amber-200" 
              : "bg-blue-500/5 border-blue-500 text-blue-900 dark:text-blue-200"
          )}>
            <div className="shrink-0 mt-1">
              {isWarning ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
            </div>
            <div className="text-sm leading-relaxed">{children}</div>
          </div>
        );
      }
      return <p {...props}>{children}</p>;
    },
    div: ({ children, className, ...props }: any) => {
      // Alert Component Handling
      if (className?.includes('alert')) {
        const isSuccess = className.includes('success');
        const isWarning = className.includes('warning');
        const isError = className.includes('error');
        const isInfo = className.includes('info');

        const type = isSuccess ? 'success' : isWarning ? 'warning' : isError ? 'error' : isInfo ? 'info' : 'default';
        
        const titleMap = {
          success: language === 'ar' ? 'نجاح!' : 'Success!',
          warning: language === 'ar' ? 'تحذير!' : 'Warning!',
          error: language === 'ar' ? 'خطأ!' : 'Error!',
          info: language === 'ar' ? 'معلومة!' : 'Info!',
          default: language === 'ar' ? 'ملاحظة:' : 'Note:'
        };

        return (
          <div className={cn(
            "my-8 p-0 rounded-xl border border-border/50 overflow-hidden shadow-sm transition-all hover:shadow-md bg-card/50",
            type === 'success' && "bg-green-500/5 border-green-500/20",
            type === 'warning' && "bg-amber-500/5 border-amber-500/20",
            type === 'error' && "bg-red-500/5 border-red-500/20",
            type === 'info' && "bg-blue-500/5 border-blue-500/20"
          )} {...props}>
            <div className="px-5 py-3 flex items-center gap-3 border-b border-border/10">
              <div className={cn(
                "p-1.5 rounded-lg shrink-0",
                type === 'success' && "bg-green-500/10 text-green-600",
                type === 'warning' && "bg-amber-500/10 text-amber-600",
                type === 'error' && "bg-red-500/10 text-red-600",
                type === 'info' && "bg-blue-500/10 text-blue-600",
                type === 'default' && "bg-muted text-muted-foreground"
              )}>
                {type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {type === 'error' && <XCircle className="h-4 w-4" />}
                {type === 'info' && <Info className="h-4 w-4" />}
                {type === 'default' && <List className="h-4 w-4" />}
              </div>
              <span className={cn(
                "font-bold text-sm tracking-tight capitalize",
                type === 'success' && "text-green-700 dark:text-green-400",
                type === 'warning' && "text-amber-700 dark:text-amber-400",
                type === 'error' && "text-red-700 dark:text-red-400",
                type === 'info' && "text-blue-700 dark:text-blue-400"
              )}>
                {titleMap[type]}
              </span>
            </div>
            
            <div className="px-5 py-4 flex gap-4">
              <div className={cn(
                "w-0.5 rounded-full shrink-0",
                type === 'success' && "bg-green-500/30",
                type === 'warning' && "bg-amber-500/30",
                type === 'error' && "bg-red-500/30",
                type === 'info' && "bg-blue-500/30",
                type === 'default' && "bg-muted"
              )} />
              <div className={cn(
                "text-sm leading-relaxed",
                type === 'success' && "text-green-900/80 dark:text-green-100/80",
                type === 'warning' && "text-amber-900/80 dark:text-amber-100/80",
                type === 'error' && "text-red-900/80 dark:text-red-100/80",
                type === 'info' && "text-blue-900/80 dark:text-blue-100/80",
                type === 'default' && "text-muted-foreground"
              )}>
                {children}
              </div>
            </div>
          </div>
        );
      }

      // Download Box Component Handling
      if (className?.includes('dlBox')) {
        return (
          <div className="my-10 p-6 rounded-2xl bg-card border border-border shadow-md flex items-center justify-between gap-6 group hover:border-primary/40 transition-all">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <Download className="h-7 w-7 transition-transform group-hover:scale-110" />
              </div>
              <div className="space-y-1">
                 <div className="font-bold text-base text-foreground flex items-center gap-2">
                    {children}
                 </div>
              </div>
            </div>
          </div>
        );
      }

      return <div className={className} {...props}>{children}</div>;
    },
    table: ({ children, className }: any) => (
      <div className={cn(
        "my-10 w-full overflow-x-auto rounded-2xl border border-border shadow-xl",
        className?.includes('sticky') && "max-h-[600px] overflow-y-auto"
      )}>
        <table className={cn(
          "w-full text-sm text-left border-collapse",
          className?.includes('stripped') && "divide-y divide-border",
          className?.includes('bordered') && "border-border"
        )}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-muted/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">{children}</thead>,
    th: ({ children }: any) => <th className="px-6 py-4 font-black text-foreground text-[11px] uppercase tracking-wider">{children}</th>,
    td: ({ children }: any) => <td className="px-6 py-4 text-foreground/80 border-b border-border/50 text-[13px]">{children}</td>,
    tr: ({ children, className }: any) => (
      <tr className={cn(
        "hover:bg-primary/[0.02] transition-colors",
        className?.includes('stripped') && "odd:bg-muted/30"
      )}>
        {children}
      </tr>
    ),
    ol: ({ children, className }: any) => {
      if (className?.includes('steps')) {
        return <InteractiveSteps language={language}>{children}</InteractiveSteps>;
      }
      return <ol className="list-decimal pl-6 my-6 space-y-3">{children}</ol>;
    },
    iframe: CustomIframe,
    video: CustomVideo
  };

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 py-8 lg:px-8"
    >
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div id="main-content" className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 min-w-0 order-2 lg:order-1">
          <h1 className="text-[32px] font-bold tracking-tight text-foreground mb-3 text-start">
            {(language === 'ar' && section.translations?.ar) ? section.translations.ar.title : section.title}
          </h1>

          {((language === 'ar' ? section.translations?.ar?.tags : section.tags) || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {(language === 'ar' ? section.translations?.ar?.tags : section.tags)?.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold border border-primary/10 transition-all hover:bg-primary/10"
                >
                  <Hash className="h-3 w-3 opacity-50" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="markdown-body prose dark:prose-invert max-w-none text-muted-foreground mb-8 text-start">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
              components={MarkdownComponents}
            >
              {linkify((language === 'ar' && section.translations?.ar) ? section.translations.ar.content : section.content)}
            </ReactMarkdown>
          </div>

          {section.id === 'overview' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 flex justify-start"
            >
              <button
                onClick={() => onNavigate('org-getting-started')}
                className="group flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
              >
                {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                <ArrowRight className={cn("h-5 w-5 transition-transform group-hover:translate-x-1", language === 'ar' && "rotate-180 group-hover:-translate-x-1")} />
              </button>
            </motion.div>
          )}

          <div className="space-y-10">
            <div className="bg-primary/[0.05] border border-primary/20 border-s-4 border-s-primary rounded-md p-4 mb-8 text-[13px] text-foreground/90 text-start">
              <strong>{language === 'ar' ? 'ملاحظة:' : 'Note:'}</strong> {language === 'ar' 
                ? 'هذا تخطيط مستندات عالي الكثافة. استخدم الشريط الجانبي للتنقل عبر الوحدات الأساسية لنظام كوبتوجرام.' 
                : 'This is a high-density documentation layout. Use the sidebar to navigate through the core modules of the Coptogram system.'}
            </div>

            {section.items?.map((item) => (
          <div key={item.id} className="scroll-mt-20 pt-2" id={item.id}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold tracking-tight text-start">
                {(language === 'ar' && item.translations?.ar) ? item.translations.ar.title : item.title}
              </h2>
              {item.version && (
                <span className="inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-tighter">
                  {item.version}
                </span>
              )}
            </div>

            {((language === 'ar' ? item.translations?.ar?.tags : item.tags) || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(language === 'ar' ? item.translations?.ar?.tags : item.tags)?.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold border border-border/50 uppercase tracking-tight"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="markdown-body prose dark:prose-invert max-w-none text-[14px] text-muted-foreground mb-4 text-start">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                components={MarkdownComponents}
              >
                {linkify((language === 'ar' && item.translations?.ar) ? item.translations.ar.description : item.description)}
              </ReactMarkdown>
            </div>

            {((language === 'ar' && item.translations?.ar?.details) || item.details) && (
              <ul className="mb-6 space-y-1.5 list-none text-[13px] text-muted-foreground">
                {((language === 'ar' && item.translations?.ar?.details) ? item.translations.ar.details : (item.details || [])).map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-foreground/80 leading-normal text-start">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
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
                  <List className="h-3 w-3" />
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
    </div>

        <aside className="w-full lg:w-64 shrink-0 order-1 lg:order-2 lg:sticky lg:top-24">
          <DocTOC items={section.items || []} language={language} />
        </aside>
      </div>

      {/* Pagination: Previous & Next Section */}
      {allDocs && allDocs.length > 1 && (
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          {prevSection ? (
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onNavigate(prevSection.id);
                window.scrollTo(0, 0);
              }}
              className="group flex flex-col items-start gap-1 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all w-full sm:w-auto sm:min-w-[200px]"
            >
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                <ChevronLeft className="h-3 w-3" />
                {language === 'ar' ? 'السابق' : 'Previous'}
              </div>
              <div className="font-bold text-foreground group-hover:text-primary transition-colors rtl:text-right">
                {language === 'ar' && prevSection.translations?.ar
                  ? prevSection.translations.ar.title
                  : prevSection.title}
              </div>
            </motion.button>
          ) : <div className="hidden sm:block" />}

          {nextSection ? (
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onNavigate(nextSection.id);
                window.scrollTo(0, 0);
              }}
              className="group flex flex-col items-end gap-1 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all w-full sm:w-auto sm:min-w-[200px] text-end"
            >
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                {language === 'ar' ? 'التالي' : 'Next'}
                <ChevronRight className="h-3 w-3" />
              </div>
              <div className="font-bold text-foreground group-hover:text-primary transition-colors ltr:text-right">
                {language === 'ar' && nextSection.translations?.ar
                  ? nextSection.translations.ar.title
                  : nextSection.title}
              </div>
            </motion.button>
          ) : <div className="hidden sm:block" />}
        </div>
      )}

      <Feedback language={language} sectionId={section.id} itemId={activeItemId} />

      <footer className="mt-20 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/coptogram/docs" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md px-2 py-1 -mx-2 hover:bg-primary/5 active:scale-95"
          >
            {language === 'ar' ? 'عدل هذه الصفحة' : 'Edit this page'} <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <span className="hidden sm:inline opacity-30 select-none">|</span>
          <span>{language === 'ar' ? 'تم التحديث في أبريل 2026' : 'Updated April 2026'}</span>
        </div>
        <div className="text-center sm:text-end opacity-80">
          © 2026 Coptogram Platform. All rights reserved.
        </div>
      </footer>
    </motion.div>
  );
}
