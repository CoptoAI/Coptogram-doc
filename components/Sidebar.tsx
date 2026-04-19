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
  Fingerprint, 
  Compass,
  MessageSquare,
  ShieldCheck,
  Building2,
  User,
  BookOpen,
  Video,
  Layout,
  Layers,
  PlayCircle,
  Megaphone,
  Box
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  docs: any[]; // Accept docs as prop
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
  Fingerprint,
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
  'user-roles': Fingerprint,
};

export function Sidebar({ activeSection, onSectionChange, isOpen, onClose, docs }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[240px] border-r border-border bg-secondary transition-transform duration-300 ease-in-out lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:block",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav 
          className="flex flex-col gap-5 p-5 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border" 
          aria-label="Documentation Sidebar"
        >
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60" id="sidebar-doc-label">
                Documentation
              </div>
              <ul className="space-y-1" aria-labelledby="sidebar-doc-label">
                {docs.map((section) => {
                  const Icon = iconMap[section.id] || iconMap[section.icon || ''] || ChevronRight;
                  const isActive = activeSection === section.id;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => {
                          onSectionChange(section.id);
                          onClose?.();
                        }}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all hover:bg-foreground/[0.03] hover:text-foreground text-start border-s-2",
                          isActive
                            ? "bg-foreground/[0.03] text-foreground border-primary"
                            : "text-muted-foreground border-transparent"
                        )}
                      >
                        <Icon className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors rtl:rotate-180",
                          isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                        )} />
                        <span className="truncate">{section.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
