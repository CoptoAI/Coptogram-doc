'use client';

import * as React from 'react';
import { docs } from '@/lib/docs-data';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  Sparkles, 
  Church, 
  Library, 
  Banknote, 
  GraduationCap, 
  Medal, 
  Radio, 
  Users, 
  Shield, 
  Compass,
  ArrowUp,
  Circle,
  Megaphone,
  ShieldCheck,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  docs: any[]; // Accept docs as prop
  language?: 'en' | 'ar';
}

const iconMap: Record<string, any> = {
  // New Branded Mapping
  Sparkles,
  Church,
  Library,
  Banknote,
  GraduationCap,
  Medal,
  Radio,
  Users,
  Shield,
  Compass,
  
  // Legacy/Keyword Mapping
  overview: Sparkles,
  monetization: Banknote,
  'course-management': Library,
  'live-learning': Radio,
  gamification: Medal,
  marketing: Megaphone,
  admin: ShieldCheck,
  community: Users,
  utilities: Box,
  tutorials: Compass,
  'user-roles': Shield,
};

export function Sidebar({ activeSection, onSectionChange, isOpen, onClose, docs, language = 'en' }: SidebarProps) {
  const [expandedOverrides, setExpandedOverrides] = React.useState<Record<string, boolean>>({});
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const navRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (navRef.current) {
      setShowScrollTop(navRef.current.scrollTop > 150);
    }
  };

  const scrollToTop = () => {
    navRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOverrides(prev => {
      const isCurrentlyExpanded = prev[id] ?? (activeSection === id);
      return { ...prev, [id]: !isCurrentlyExpanded };
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[240px] border-r border-border bg-secondary transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:block lg:transition-none shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative h-full">
          <nav 
            ref={navRef}
            onScroll={handleScroll}
            className="flex flex-col gap-5 p-5 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border scroll-smooth" 
            aria-label="Documentation Sidebar"
          >
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60" id="sidebar-doc-label">
                  {language === 'ar' ? 'التوثيق' : 'Documentation'}
                </div>
                <ul className="space-y-1" aria-labelledby="sidebar-doc-label">
                  {docs.map((section) => {
                    const Icon = iconMap[section.id] || iconMap[section.icon || ''] || ChevronRight;
                    const isActive = activeSection === section.id;
                    const isExpanded = expandedOverrides[section.id] ?? isActive;
                    const hasItems = section.items && section.items.length > 0;
                    const panelId = `panel-${section.id}`;
                    const triggerId = `trigger-${section.id}`;

                    return (
                      <li key={section.id} className="space-y-1">
                        <div className="flex items-center">
                          <button
                            id={triggerId}
                            onClick={() => {
                              onSectionChange(section.id);
                              if (window.innerWidth < 1024) onClose?.();
                            }}
                            aria-current={isActive ? "page" : undefined}
                            aria-expanded={hasItems ? isExpanded : undefined}
                            aria-controls={hasItems ? panelId : undefined}
                            className={cn(
                              "group flex flex-1 items-center justify-between rounded-md px-3 py-1.5 text-[13px] font-medium transition-all hover:bg-foreground/[0.03] hover:text-foreground text-start",
                              isActive
                                ? "bg-foreground/[0.03] text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Icon className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-colors rtl:rotate-180",
                                isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                              )} aria-hidden="true" />
                              <span className="truncate">{section.title}</span>
                            </div>
                          </button>
                          
                          {hasItems && (
                            <button 
                              onClick={(e) => toggleSection(section.id, e)}
                              aria-label={isExpanded ? (language === 'ar' ? 'طي القسم' : 'Collapse section') : (language === 'ar' ? 'توسيع القسم' : 'Expand section')}
                              aria-expanded={isExpanded}
                              aria-controls={panelId}
                              className="p-1.5 hover:bg-foreground/5 rounded transition-colors mr-1 rtl:mr-0 rtl:ml-1"
                            >
                              <ChevronRight className={cn(
                                "h-3 w-3 transition-transform duration-200",
                                isExpanded && "rotate-90"
                              )} aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        <AnimatePresence initial={false}>
                          {isExpanded && hasItems && (
                            <motion.ul
                              id={panelId}
                              role="group"
                              aria-labelledby={triggerId}
                              initial={{ height: 0, opacity:0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden space-y-0.5 mt-0.5 ms-6 border-s border-border"
                            >
                              {section.items.map((item: any) => (
                                <li key={item.id}>
                                  <button 
                                    onClick={() => {
                                      const el = document.getElementById(item.id);
                                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                                      if (window.innerWidth < 1024) onClose?.();
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-1 text-[12px] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02] transition-all text-start group/item"
                                  >
                                    <Circle className="h-1 w-1 fill-muted-foreground/50 group-hover/item:fill-primary transition-colors" />
                                    <span className="truncate">{item.title}</span>
                                  </button>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </nav>

          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToTop}
                className={cn(
                  "absolute bottom-4 z-50 p-2 rounded-full bg-background border border-border shadow-lg hover:bg-muted text-primary transition-colors",
                  language === 'ar' ? "left-4" : "right-4"
                )}
                aria-label={language === 'ar' ? 'العودة إلى الأعلى' : 'Scroll sidebar to top'}
                title={language === 'ar' ? 'العودة إلى الأعلى' : 'Scroll sidebar to top'}
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}
