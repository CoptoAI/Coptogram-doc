'use client';

import * as React from 'react';
import { docs } from '@/lib/docs-data';
import { motion } from 'motion/react';
import { 
  Building2, 
  User, 
  BookOpen, 
  CreditCard, 
  Trophy, 
  Video, 
  MessageSquare,
  Layout,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Search,
  Sparkles,
  Church,
  Library,
  Banknote,
  Medal,
  Radio,
  Users,
  Fingerprint,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  Building2,
  User,
  BookOpen,
  CreditCard,
  Trophy,
  Video,
  MessageSquare,
  Layout,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Church,
  Library,
  Banknote,
  Medal,
  Radio,
  Users,
  Fingerprint,
  Compass
};

interface LandingViewProps {
  onSectionSelect: (id: string) => void;
  onSearch: (query: string) => void;
  docs: any[];
  language?: 'en' | 'ar';
  siteConfig?: any;
}

export function LandingView({ onSectionSelect, onSearch, docs, language = 'en', siteConfig }: LandingViewProps) {
  // Group docs by category
  const overviewDoc = docs.find(d => d.id === 'overview');
  const orgDocs = docs.filter(d => d.category === 'organization');
  const studentDocs = docs.filter(d => d.category === 'student');
  const generalDocs = docs.filter(d => d.category === 'general' && d.id !== 'overview');

  const heroTitle = language === 'ar' 
    ? (siteConfig?.translations?.ar?.heroTitle || 'ابحث عن إجابات أو تصفح حسب الموضوع')
    : (siteConfig?.heroTitle || 'Search for answers or browse by topic');

  const heroSubtitle = language === 'ar'
    ? (siteConfig?.translations?.ar?.heroSubtitle || 'أتقن المعرفة الروحية من خلال أدلتنا ومواردنا الشاملة.')
    : (siteConfig?.heroSubtitle || 'Master spiritual knowledge with our comprehensive guides and resources.');

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:py-24">
      {/* Editorial Hero Section */}
      <div className="relative mb-24">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest mb-6"
          >
            <Sparkles className="h-3 w-3" />
            Knowledge Base
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-[44px] md:text-[64px] lg:text-[84px] font-black tracking-tight text-foreground leading-[1] mb-8 uppercase",
              language === 'ar' && "font-bold"
            )}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {heroSubtitle}
          </motion.p>
          
          <div className="max-w-2xl mx-auto relative group">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors",
              language === 'ar' ? "right-5" : "left-5"
            )} />
            <input 
              type="text" 
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              placeholder={language === 'ar' ? 'ابحث عن مقالات...' : 'Search for articles...'}
              className={cn(
                "w-full h-16 rounded-2xl border border-border bg-card shadow-2xl text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all",
                language === 'ar' ? "pr-14 pl-6" : "pl-14 pr-6"
              )}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Overview/Welcome Panel */}
      {overviewDoc && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24 grid lg:grid-cols-2 gap-0 border border-border rounded-[2.5rem] bg-card overflow-hidden shadow-2xl"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className={cn(
              "h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-8",
              language === 'ar' ? "ml-auto" : "mr-auto"
            )}>
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              {overviewDoc.title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {overviewDoc.content}
            </p>
            <button 
              onClick={() => onSectionSelect(overviewDoc.id)}
              className="flex items-center gap-3 py-4 px-8 rounded-2xl bg-foreground text-background font-bold w-fit hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="relative h-64 lg:h-auto min-h-[400px] bg-muted/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
            <div className="absolute inset-0 flex items-center justify-center p-12">
               <div className="relative w-full aspect-square max-w-md">
                  <div className="absolute inset-0 rounded-[3rem] border border-primary/20 rotate-6" />
                  <div className="absolute inset-0 rounded-[3rem] border border-secondary/20 -rotate-3" />
                  <div className="absolute inset-0 rounded-[3rem] bg-background/80 backdrop-blur-xl border border-border overflow-hidden flex items-center justify-center p-8">
                    <Sparkles className="h-24 w-24 text-primary/20 animate-pulse" />
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Grid */}
      <div className="mb-24">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
             <span className="h-1.5 w-1.5 rounded-full bg-primary" />
             {language === 'ar' ? 'تصفح حسب الفئة' : 'Browse by Category'}
          </h3>
          <div className="h-[1px] flex-1 bg-border mx-6 hidden sm:block" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {generalDocs.map((doc, idx) => {
            const Icon = iconMap[doc.icon || 'Layout'] || Layout;
            return (
              <motion.button
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSectionSelect(doc.id)}
                className="group flex flex-col p-8 rounded-[2rem] border border-border bg-card hover:border-primary/50 hover:shadow-xl transition-all text-start"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                  "bg-primary/5 text-primary"
                )}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {doc.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
                  {language === 'ar' ? `${doc.items?.length || 0} مقالات في هذا القسم` : `${doc.items?.length || 0} articles in this guide`}
                </p>
                <span className="mt-auto text-xs font-bold uppercase tracking-widest text-primary/60 group-hover:text-primary flex items-center gap-2">
                  View Guide
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="space-y-12">
        <div className="border border-border rounded-3xl bg-card overflow-hidden shadow-sm">
           <div className="p-8 border-b border-border bg-muted/30">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Church className="h-6 w-6 text-amber-600" />
                {language === 'ar' ? 'المنظمات (الإدارة)' : 'Organizations (Management)'}
              </h2>
           </div>
           <div className="divide-y divide-border">
             {orgDocs.map(doc => (
               <button 
                key={doc.id}
                onClick={() => onSectionSelect(doc.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors group text-start"
               >
                 <span className="font-medium text-foreground group-hover:text-primary transition-colors">{doc.title}</span>
                 <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 group-hover:text-primary transition-all" />
               </button>
             ))}
           </div>
        </div>

        <div className="border border-border rounded-3xl bg-card overflow-hidden shadow-sm">
           <div className="p-8 border-b border-border bg-muted/30">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-emerald-600" />
                {language === 'ar' ? 'الطلاب (التعلم)' : 'Students (Learning)'}
              </h2>
           </div>
           <div className="divide-y divide-border">
             {studentDocs.map(doc => (
               <button 
                key={doc.id}
                onClick={() => onSectionSelect(doc.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors group text-start"
               >
                 <span className="font-medium text-foreground group-hover:text-primary transition-colors">{doc.title}</span>
                 <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 group-hover:text-primary transition-all" />
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
