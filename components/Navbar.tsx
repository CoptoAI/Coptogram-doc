'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Search, Github, Monitor, Palette, Menu, Languages, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onThemeColorChange: (color: string) => void;
  onToggleSidebar: () => void;
  onHomeClick: () => void;
  language?: 'en' | 'ar';
  onLanguageChange?: (lang: 'en' | 'ar') => void;
}

export function Navbar({ searchQuery, onSearch, onThemeColorChange, onToggleSidebar, onHomeClick, language = 'en', onLanguageChange }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!mounted) return null;

  const themeColors = [
    { name: 'default', color: '#10b981', label: 'Emerald (Default)' },
    { name: 'amber', color: '#f59e0b', label: 'Amber' },
    { name: 'emerald', color: '#10b981', label: 'Emerald' },
    { name: 'rose', color: '#f43f5e', label: 'Rose' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/60">
      <div className="mx-auto flex h-14 items-center gap-4 px-5">
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 hover:bg-muted lg:hidden"
          aria-label={language === 'ar' ? 'تبديل الشريط الجانبي' : 'Toggle Sidebar'}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div 
          className="flex items-center gap-2 font-bold text-foreground text-sm cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onHomeClick}
        >
          <Monitor className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline-block tracking-tight">
            {language === 'ar' ? 'كوبتوجرام دوكس' : 'Coptogram Docs'}
          </span>
          <span className="hidden md:inline-flex ml-2 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/20">
            v2.4.1
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <motion.div 
            className="relative w-full max-w-[400px]"
            animate={{ 
              scale: searchFocused ? 1.02 : 1,
              boxShadow: searchFocused ? '0 0 20px -5px rgba(var(--primary), 0.2)' : '0 0 0px 0px rgba(0,0,0,0)'
            }}
            transition={{ duration: 0.2 }}
          >
            <Search className={cn(
              "absolute top-2.5 h-3.5 w-3.5 transition-colors",
              language === 'ar' ? 'right-2.5' : 'left-2.5',
              searchFocused ? "text-primary" : "text-muted-foreground"
            )} aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              placeholder={language === 'ar' ? "ابحث في المستندات (Ctrl+K)" : "Search documentation (Ctrl+K)"}
              aria-label={language === 'ar' ? "البحث في المستندات. استخدم Ctrl plus K للتركيز على البحث." : "Search documentation. Use Ctrl plus K to focus search."}
              className={cn(
                "h-8 w-full rounded-md border bg-muted py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all",
                language === 'ar' ? "ps-4 pe-9" : "ps-9 pe-8",
                searchFocused ? "border-primary/50 bg-background" : "border-border"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={(e) => onSearch(e.target.value)}
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => onSearch('')}
                  className={cn(
                    "absolute top-1.5 p-1 rounded-full hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary",
                    language === 'ar' ? "left-1.5" : "right-1.5"
                  )}
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="hidden lg:inline hover:text-foreground cursor-pointer transition-colors">
            {language === 'ar' ? 'سجل التغييرات' : 'Changelog'}
          </span>
          
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="rounded-md p-1.5 hover:bg-muted"
              aria-label="Change brand color theme"
              aria-expanded={showColorPicker}
              aria-haspopup="true"
            >
              <Palette className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-10 z-50 rounded-lg border border-border bg-card p-2 shadow-lg"
                  role="dialog"
                  aria-label="Choose a brand color"
                >
                  <div className="flex gap-2">
                      {themeColors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          onThemeColorChange(c.name);
                          setShowColorPicker(false);
                        }}
                        className="h-6 w-6 rounded-full border border-border transition-transform hover:scale-110 relative"
                        style={{ backgroundColor: c.color }}
                        aria-label={`Set theme to ${c.label}`}
                      >
                        {document.documentElement.getAttribute('data-theme') === c.name && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-md p-2 hover:bg-muted"
            aria-label={language === 'ar' 
              ? (theme === 'dark' ? "التبديل إلى المظهر الفاتح" : "التبديل إلى المظهر الداكن")
              : (theme === 'dark' ? "Switch to light theme" : "Switch to dark theme")
            }
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-2 hover:bg-muted"
            aria-label={language === 'ar' ? "عرض على GitHub" : "View on GitHub"}
          >
            <Github className="h-5 w-5" />
          </a>

          <a
            href="/admin"
            className="flex items-center gap-1.5 rounded-md px-3 py-1 bg-foreground text-background hover:opacity-90 transition-opacity border border-foreground/20 font-bold"
            aria-label={language === 'ar' ? "لوحة الإدارة" : "Admin Panel"}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase">{language === 'ar' ? 'الإدارة' : 'Admin'}</span>
          </a>

          <button
            onClick={() => onLanguageChange?.(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
            aria-label={language === 'ar' ? "تغيير اللغة" : "Toggle language"}
          >
            <Languages className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
