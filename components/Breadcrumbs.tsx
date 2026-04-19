'use client';

import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  items: {
    label: string;
    onClick?: () => void;
    active?: boolean;
  }[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground", className)} aria-label="Breadcrumb">
      <button 
        type="button"
        className="flex items-center hover:text-primary transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm p-0.5 active:scale-90" 
        onClick={() => items.length > 0 && items[0].onClick?.()}
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-3 w-3 flex-shrink-0 rtl:rotate-180 opacity-40 shrink-0" />
          <button
            type="button"
            onClick={item.onClick}
            disabled={item.active}
            className={cn(
              "transition-all px-1.5 py-0.5 rounded-md -mx-1",
              item.active 
                ? "text-foreground font-semibold cursor-default" 
                : "cursor-pointer hover:text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
            )}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}
