'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DocSection } from '@/lib/docs-data';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { DocContent } from '@/components/DocContent';
import { TableOfContents } from '@/components/TableOfContents';
import { LandingView } from '@/components/LandingView';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import Fuse from 'fuse.js';
import { cn } from '@/lib/utils';

interface DocsManagerProps {
  docs: DocSection[];
  children?: React.ReactNode;
}

export function DocsManager({ docs: initialDocs, children }: DocsManagerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sectionParam = searchParams.get('section');
  const itemParam = searchParams.get('item');
  const langParam = searchParams.get('lang') as 'en' | 'ar' | null;

  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(sectionParam);
  const [activeItemId, setActiveItemId] = React.useState<string | null>(itemParam);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [themeColor, setThemeColor] = React.useState('default');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [language, setLanguage] = React.useState<'en' | 'ar'>(langParam === 'ar' ? 'ar' : 'en');
  const [docsData] = React.useState<DocSection[]>(initialDocs);
  const [siteConfig] = React.useState<any>({
    heroTitle: 'Coptogram Learning Docs',
    heroSubtitle: 'Master spiritual knowledge with our comprehensive guides and resources.',
    translations: {
      ar: {
        heroTitle: 'وثائق كوبتوغرام التعليمية',
        heroSubtitle: 'أتقن المعرفة الروحية من خلال أدلتنا ومواردنا الشاملة.'
      }
    }
  });

  // Sync state with URL
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (activeSectionId) {
      params.set('section', activeSectionId);
    } else {
      params.delete('section');
    }

    if (activeItemId) {
      params.set('item', activeItemId);
    } else {
      params.delete('item');
    }
    
    if (language === 'ar') {
      params.set('lang', 'ar');
    } else {
      params.delete('lang');
    }

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [activeSectionId, activeItemId, language, searchParams]);

  const localizedDocs = React.useMemo(() => {
    return docsData.map(section => {
      const localizedSection = { ...section };
      if (language === 'ar' && section.translations?.ar) {
        localizedSection.title = section.translations.ar.title;
        localizedSection.content = section.translations.ar.content;
      }
      
      if (section.items) {
        localizedSection.items = section.items.map(item => {
          const localizedItem = { ...item };
          if (language === 'ar' && item.translations?.ar) {
            localizedItem.title = item.translations.ar.title;
            localizedItem.description = item.translations.ar.description;
            if (item.translations.ar.details) {
              localizedItem.details = item.translations.ar.details;
            }
          }
          return localizedItem;
        });
      }
      
      return localizedSection;
    });
  }, [language, docsData]);

  const activeSection = localizedDocs.find((s) => s.id === activeSectionId) || localizedDocs[0];

  const handleThemeColorChange = (color: string) => {
    setThemeColor(color);
    document.documentElement.setAttribute('data-theme', color);
  };

  // Prepare searchable items for Fuse.js
  const searchableItems = React.useMemo(() => {
    const items: { 
      sectionId: string; 
      itemId?: string; 
      title: string; 
      content: string; 
      titleAr: string;
      contentAr: string;
      type: 'section' | 'item';
      sectionTitle?: string;
      sectionTitleAr?: string;
    }[] = [];
    
    docsData.forEach(section => {
      // Add section itself
      const sectionTitle = section.title;
      const sectionTitleAr = section.translations?.ar?.title || '';

      items.push({
        sectionId: section.id,
        title: sectionTitle,
        content: section.content,
        titleAr: sectionTitleAr,
        contentAr: section.translations?.ar?.content || '',
        type: 'section'
      });
      
      // Add items within section
      section.items?.forEach(item => {
        items.push({
          sectionId: section.id,
          itemId: item.id,
          title: item.title,
          content: `${item.description} ${item.details?.join(' ') || ''}`,
          titleAr: item.translations?.ar?.title || '',
          contentAr: `${item.translations?.ar?.description || ''} ${item.translations?.ar?.details?.join(' ') || ''}`,
          type: 'item',
          sectionTitle: sectionTitle,
          sectionTitleAr: sectionTitleAr
        });
      });
    });
    
    return items;
  }, [docsData]);

  // Fuse.js instance with enhanced scoring and multi-language support
  const fuse = React.useMemo(() => new Fuse(searchableItems, {
    keys: [
      { name: 'title', weight: 1.5 },
      { name: 'titleAr', weight: 1.5 },
      { name: 'sectionTitle', weight: 0.8 },
      { name: 'sectionTitleAr', weight: 0.8 },
      { name: 'content', weight: 0.4 },
      { name: 'contentAr', weight: 0.4 }
    ],
    threshold: 0.35, // Balanced fuzziness
    location: 0,
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
    includeMatches: true, // Needed for highlighting
    useExtendedSearch: true,
    findAllMatches: true,
    ignoreLocation: false
  }), [searchableItems]);

  // Simple highlighting function
  const highlightText = (text: string, matches: readonly any[] | undefined, key: string) => {
    if (!matches || !text) return text;
    
    const match = matches.find(m => m.key === key);
    if (!match) return text;

    // Sort indices and handle overlapping/adjacent matches
    const indices = [...match.indices].sort((a, b) => a[0] - b[0]);
    
    let result: React.ReactNode[] = [];
    let lastIndex = 0;

    indices.forEach(([start, end], i) => {
      // Normal text before match
      if (start > lastIndex) {
        result.push(text.slice(lastIndex, start));
      }
      // Highlighted text
      result.push(
        <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5 border-b border-primary/30">
          {text.slice(start, end + 1)}
        </mark>
      );
      lastIndex = end + 1;
    });

    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  // Search results calculation using Fuse.js
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];

    return fuse.search(searchQuery)
      .map(result => {
        const isAr = language === 'ar';
        const titleKey = isAr ? 'titleAr' : 'title';
        const sectionTitleKey = isAr ? 'sectionTitleAr' : 'sectionTitle';

        let displayTitle = result.item[titleKey];
        let displaySectionTitle = result.item[sectionTitleKey];

        return {
          sectionId: result.item.sectionId,
          itemId: result.item.itemId,
          title: displayTitle,
          highlightedTitle: highlightText(displayTitle, result.matches, titleKey),
          sectionTitle: displaySectionTitle,
          highlightedSectionTitle: displaySectionTitle ? highlightText(displaySectionTitle, result.matches, sectionTitleKey) : null,
          matchType: result.item.type,
          score: result.score
        };
      })
      .slice(0, 10);
  }, [searchQuery, fuse, language]);

  const handleResultClick = React.useCallback((sectionId: string, itemId?: string) => {
    setActiveSectionId(sectionId);
    setActiveItemId(itemId || null);
    setSearchQuery('');
    if (itemId) {
      setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  // Handle initial scroll to item if present in URL
  React.useEffect(() => {
    if (activeItemId) {
      setTimeout(() => {
        const el = document.getElementById(activeItemId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [activeItemId]); // Scroll when item changes or on mount

  const navigateToSection = React.useCallback((id: string | null) => {
    setActiveSectionId(id);
    setActiveItemId(null);
    
    // Update URL
    const params = new URLSearchParams(window.location.search);
    if (id) {
      params.set('section', id);
    } else {
      params.delete('section');
    }
    params.delete('item');
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, []);

  // Keyboard Navigation Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in inputs or search
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const activeId = activeSectionId || docsData[0]?.id;

      // Navigate Items (Ctrl/Cmd + Arrows)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        const section = docsData.find(s => s.id === activeId);
        if (!section || !section.items || section.items.length === 0) return;

        e.preventDefault();
        const currentIndex = section.items.findIndex(item => item.id === activeItemId);
        let nextIndex = currentIndex;

        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex === -1 ? 0 : Math.min(section.items.length - 1, currentIndex + 1);
        } else if (e.key === 'ArrowUp') {
          nextIndex = currentIndex === -1 ? 0 : Math.max(0, currentIndex - 1);
        }

        if (nextIndex !== currentIndex && nextIndex !== -1) {
          handleResultClick(section.id, section.items[nextIndex].id);
        }
        return;
      }

      // Navigate Sections (ArrowUp / ArrowDown)
      if (!e.ctrlKey && !e.metaKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const currentIndex = docsData.findIndex(s => s.id === activeSectionId);
        let nextIndex = currentIndex;

        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex === -1 ? 0 : Math.min(docsData.length - 1, currentIndex + 1);
        } else if (e.key === 'ArrowUp') {
          nextIndex = currentIndex === -1 ? 0 : Math.max(0, currentIndex - 1);
        }

        if (nextIndex !== currentIndex && nextIndex !== -1) {
          const nextSection = docsData[nextIndex];
          if (nextSection) navigateToSection(nextSection.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSectionId, activeItemId, docsData, handleResultClick, navigateToSection]);

  return (
    <div className="flex min-h-screen flex-col bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        {language === 'ar' ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>
      <Navbar 
        searchQuery={searchQuery}
        onSearch={setSearchQuery} 
        onThemeColorChange={handleThemeColorChange} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onHomeClick={() => navigateToSection(null)}
        language={language}
        onLanguageChange={setLanguage}
      />
      
      {!activeSectionId && !searchQuery ? (
        <main id="main-content" className="flex-1" tabIndex={-1}>
          <LandingView 
            onSectionSelect={navigateToSection} 
            onSearch={setSearchQuery} 
            docs={localizedDocs}
            language={language}
            siteConfig={siteConfig}
          />
        </main>
      ) : (
        <div className="container mx-auto flex-1 items-start lg:grid lg:grid-cols-[240px_minmax(0,1fr)_200px] lg:gap-10">
          <Sidebar 
            activeSection={activeSectionId || ''} 
            onSectionChange={navigateToSection} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            docs={localizedDocs}
            language={language}
          />
          
          <main 
            id="main-content" 
            className={cn(
              "relative py-6 lg:gap-10 lg:py-8 lg:px-4 min-h-[calc(100vh-3.5rem)]",
              searchQuery ? "lg:col-span-2" : ""
            )} 
            tabIndex={-1}
          >
            <AnimatePresence mode="wait">
              {searchQuery ? (
                <motion.div
                  key="search-results"
                  role="region"
                  aria-live="polite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-auto max-w-4xl px-4 py-8"
                >
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Search className="h-6 w-6 text-primary" />
                      {language === 'ar' ? (
                        <>نتائج البحث عن &quot;{searchQuery}&quot;</>
                      ) : (
                        <>Search Results for &quot;{searchQuery}&quot;</>
                      )}
                    </h2>
                    <button onClick={() => setSearchQuery('')} className="p-2 hover:bg-muted rounded-full">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {searchResults.length > 0 ? (
                    <ul className="grid gap-4" role="list">
                      {searchResults.map((result, idx) => (
                        <li key={`${result.sectionId}-${result.itemId || 'sec'}-${idx}`}>
                          <button
                            className="flex items-center justify-between group w-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all text-start"
                            onClick={() => handleResultClick(result.sectionId, result.itemId)}
                          >
                            <div>
                              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5 flex-wrap">
                                {result.matchType === 'section' 
                                  ? (language === 'ar' ? 'قسم التوثيق' : 'Documentation Section') 
                                  : (language === 'ar' ? 'عنصر مرجعي' : 'Reference Item')}
                                {result.sectionTitle && (
                                  <>
                                    <span className="text-muted-foreground/40">•</span>
                                    <span className="text-muted-foreground normal-case">
                                      {result.highlightedSectionTitle || result.sectionTitle}
                                    </span>
                                  </>
                                )}
                                {idx < 3 && <Sparkles className="h-3 w-3 animate-pulse" aria-hidden="true" />}
                              </div>
                              <div className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                                {result.highlightedTitle || result.title}
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <p className="text-muted-foreground text-lg italic">
                        {language === 'ar' 
                          ? 'لم يتم العثور على نتائج لاستعلامك. جرب كلمات رئيسية مختلفة.' 
                          : 'No results found for your query. Try different keywords.'}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <DocContent 
                  section={activeSection} 
                  onNavigate={(id) => navigateToSection(id === 'home' ? null : id)} 
                  activeItemId={activeItemId}
                  language={language}
                  onLinkClick={handleResultClick}
                  allDocs={docsData}
                >
                  {children}
                </DocContent>
              )}
            </AnimatePresence>
          </main>

          {!searchQuery && activeSectionId && (
            <aside className="hidden lg:block lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:py-8 overflow-y-auto">
              <TableOfContents items={activeSection?.items || []} language={language} />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
