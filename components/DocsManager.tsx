'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { docs as staticDocs, DocSection, DocItem } from '@/lib/docs-data';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { DocContent } from '@/components/DocContent';
import { TableOfContents } from '@/components/TableOfContents';
import { LandingView } from '@/components/LandingView';
import { motion, AnimatePresence } from 'motion/react';
import { SearchIcon, XIcon, ArrowRightIcon, SparklesIcon, Loader2 } from 'lucide-react';
import Fuse from 'fuse.js';

export function DocsManager() {
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
  const [docsData, setDocsData] = React.useState<DocSection[]>(staticDocs);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  // Load from Firestore
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'sections'), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setIsDataLoaded(true);
          return;
        }

        const sectionsList: DocSection[] = [];
        for (const sectionDoc of snapshot.docs) {
          const sectionData = sectionDoc.data() as DocSection;
          // Subcollection
          const itemsQ = query(collection(db, `sections/${sectionDoc.id}/items`), orderBy('order', 'asc'));
          const itemsSnapshot = await getDocs(itemsQ);
          sectionData.items = itemsSnapshot.docs.map(d => d.data() as DocItem);
          sectionsList.push(sectionData);
        }
        
        setDocsData(sectionsList);
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Firestore fetch error:', error);
        setIsDataLoaded(true); // Fallback to static
      }
    };
    
    fetchData();
  }, []);

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
      type: 'section' | 'item' 
    }[] = [];
    
    docsData.forEach(section => {
      // Add section itself
      items.push({
        sectionId: section.id,
        title: section.title,
        content: section.content,
        titleAr: section.translations?.ar?.title || '',
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
          type: 'item'
        });
      });
    });
    
    return items;
  }, [docsData]);

  // Fuse.js instance with enhanced scoring and multi-language support
  const fuse = React.useMemo(() => new Fuse(searchableItems, {
    keys: [
      { name: 'title', weight: 1.0 },
      { name: 'titleAr', weight: 1.0 },
      { name: 'content', weight: 0.4 },
      { name: 'contentAr', weight: 0.4 }
    ],
    threshold: 0.25, // Lower means stricter, higher means fuzzier
    location: 0,
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
    useExtendedSearch: true,
    findAllMatches: true,
    ignoreLocation: false // Better for specific keyword searches
  }), [searchableItems]);

  // Search results calculation using Fuse.js
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];

    return fuse.search(searchQuery)
      .map(result => {
        // Find the localized title for the result display
        let displayTitle = result.item.title;
        if (language === 'ar' && result.item.titleAr) {
          displayTitle = result.item.titleAr;
        }

        return {
          sectionId: result.item.sectionId,
          itemId: result.item.itemId,
          title: displayTitle,
          matchType: result.item.type,
          score: result.score
        };
      })
      .slice(0, 8);
  }, [searchQuery, fuse, language]);

  const handleResultClick = (sectionId: string, itemId?: string) => {
    setActiveSectionId(sectionId);
    setActiveItemId(itemId || null);
    setSearchQuery('');
    if (itemId) {
      setTimeout(() => {
        const el = document.getElementById(itemId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Handle initial scroll to item if present in URL
  React.useEffect(() => {
    if (activeItemId) {
      setTimeout(() => {
        const el = document.getElementById(activeItemId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [activeItemId]); // Scroll when item changes or on mount

  const navigateToSection = (id: string | null) => {
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
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
        <main className="flex-1">
          <LandingView 
            onSectionSelect={navigateToSection} 
            onSearch={setSearchQuery} 
            docs={localizedDocs}
            language={language}
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
          
          <main className="relative py-6 lg:gap-10 lg:py-8 lg:pl-4 min-h-[calc(100vh-3.5rem)]">
            <AnimatePresence mode="wait">
              {searchQuery ? (
                <motion.div
                  key="search-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-auto max-w-4xl px-4 py-8"
                >
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <SearchIcon className="h-6 w-6 text-primary" />
                      {language === 'ar' ? (
                        <>نتائج البحث عن &quot;{searchQuery}&quot;</>
                      ) : (
                        <>Search Results for &quot;{searchQuery}&quot;</>
                      )}
                    </h2>
                    <button onClick={() => setSearchQuery('')} className="p-2 hover:bg-muted rounded-full">
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="grid gap-4">
                      {searchResults.map((result, idx) => (
                        <button
                          key={`${result.sectionId}-${result.itemId || 'sec'}-${idx}`}
                          className="flex items-center justify-between group p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all text-start"
                          onClick={() => handleResultClick(result.sectionId, result.itemId)}
                        >
                          <div>
                            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              {result.matchType === 'section' 
                                ? (language === 'ar' ? 'قسم التوثيق' : 'Documentation Section') 
                                : (language === 'ar' ? 'عنصر مرجعي' : 'Reference Item')}
                              {idx < 3 && <SparklesIcon className="h-3 w-3" />}
                            </div>
                            <div className="text-lg font-bold group-hover:text-primary transition-colors">
                              {result.title}
                            </div>
                          </div>
                          <ArrowRightIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
                      <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <p className="text-muted-foreground text-lg italic">
                        {language === 'ar' 
                          ? 'لم يتم العثور على نتائج لاستعلامك. جرب كلمات رئيسية مختلفة.' 
                          : 'No results found for your query. Try different keywords.'}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-col xl:flex-row lg:gap-10">
                  <div className="flex-1">
                    <DocContent 
                      section={activeSection} 
                      onNavigate={(id) => navigateToSection(id === 'home' ? null : id)} 
                      activeItemId={activeItemId}
                      language={language}
                      onLinkClick={handleResultClick}
                      allDocs={docsData}
                    />
                  </div>
                  <TableOfContents items={activeSection.items || []} language={language} />
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  );
}
