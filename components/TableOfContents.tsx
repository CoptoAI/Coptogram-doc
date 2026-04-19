'use client';

import * as React from 'react';
import { DocItem } from '@/lib/docs-data';
import { cn } from '@/lib/utils';

interface TOCProps {
  items: DocItem[];
  language?: 'en' | 'ar';
}

export function TableOfContents({ items, language = 'en' }: TOCProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const observers = new Map();

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    });

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) {
        observer.observe(el);
        observers.set(item.id, el);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <aside className="sticky top-20 hidden w-[200px] shrink-0 lg:block">
      <nav 
        className="space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto ps-2 pe-4 scrollbar-thin scrollbar-thumb-border" 
        aria-label="Table of contents"
      >
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60" id="toc-label">
          {language === 'ar' ? 'في هذه الصفحة' : 'On this page'}
        </div>
        <ul className="flex flex-col space-y-2" aria-labelledby="toc-label">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "text-start text-[12px] transition-all hover:text-foreground w-full py-1 px-2 -mx-2 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 active:opacity-70",
                    isActive
                      ? "font-semibold text-primary bg-primary/5"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {item.title}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="pt-8 mt-8 border-t border-border">
           <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
            {language === 'ar' ? 'مساعدة' : 'Help'}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {language === 'ar' ? 'وجدت خطأ؟' : 'Found a mistake?'} <span className="text-primary underline cursor-pointer">{language === 'ar' ? 'حرر هذه الصفحة على GitHub' : 'Edit this page on GitHub'}</span>
          </p>
        </div>
      </nav>
    </aside>
  );
}
