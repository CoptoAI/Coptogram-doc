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
}

export function LandingView({ onSectionSelect, onSearch, docs, language = 'en' }: LandingViewProps) {
  // Group docs by category
  const orgDocs = docs.filter(d => d.category === 'organization');
  const studentDocs = docs.filter(d => d.category === 'student');
  const generalDocs = docs.filter(d => d.category === 'general' && d.id !== 'overview');

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[36px] font-bold tracking-tight text-foreground mb-4"
        >
          {language === 'ar' ? 'ابحث عن إجابات أو تصفح حسب الموضوع' : 'Search for answers or browse by topic'}
        </motion.h1>
        
        <div className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors ps-4" />
          <input 
            type="text" 
            placeholder={language === 'ar' ? 'ابحث عن مقالات...' : 'Search for articles...'}
            className="w-full h-14 ps-12 pe-4 rounded-xl border border-border bg-card shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
        {docs.map((doc, idx) => {
          const Icon = iconMap[doc.icon || 'Layout'] || Layout;
          return (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSectionSelect(doc.id)}
              className="group flex flex-col p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all text-start"
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110",
                doc.category === 'organization' ? "bg-amber-500/10 text-amber-600" : 
                doc.category === 'student' ? "bg-emerald-500/10 text-emerald-600" : 
                "bg-primary/10 text-primary"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {doc.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {language === 'ar' ? `${doc.items?.length || 0} مقالات` : `${doc.items?.length || 0} articles`}
              </p>
            </motion.button>
          )
        })}
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
