'use client';

import * as React from 'react';
import { DocItem } from '@/lib/docs-data';
import { cn } from '@/lib/utils';
import { ListIcon, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface DocTOCProps {
  items: DocItem[];
  className?: string;
  language?: 'en' | 'ar';
}

export function DocTOC({ items, className, language = 'en' }: DocTOCProps) {
  if (!items || items.length === 0) return null;

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Adjust for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={cn(
      "mb-10 p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className="flex items-center gap-2 mb-6 text-[11px] font-bold uppercase tracking-widest text-primary">
        <ListIcon className="h-4 w-4" />
        {language === 'ar' ? 'المحتويات في هذا القسم' : 'Contents in this section'}
      </div>
      
      <nav className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {items.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => scrollToElement(item.id)}
            className="group flex items-center gap-2 text-[14px] text-muted-foreground hover:text-primary transition-all text-start truncate px-2 py-1 -mx-2 rounded-md hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
          >
            <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary rtl:rotate-180" />
            <span className="truncate group-hover:font-medium transition-all">{item.title}</span>
          </motion.button>
        ))}
      </nav>
    </div>
  );
}
