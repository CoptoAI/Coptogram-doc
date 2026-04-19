'use client';

import * as React from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export function Feedback() {
  const [feedback, setFeedback] = React.useState<'positive' | 'negative' | null>(null);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    // In a real app, you would send this to an API or database
    console.log(`Feedback received: ${type}`);
  };

  return (
    <div className="mt-16 pt-8 border-t border-border/60 max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {feedback ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 py-6 px-8 rounded-2xl bg-primary/5 border border-primary/20 text-primary"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Thanks for your feedback! It helps us improve the documentation.</span>
          </motion.div>
        ) : (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8"
          >
            <div className="space-y-1">
              <h4 className="text-[14px] font-semibold text-foreground">Was this page helpful?</h4>
              <p className="text-[12px] text-muted-foreground">Your feedback helps us make Coptogram better for everyone.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback('positive')}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all text-[12px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 shadow-sm hover:shadow-md"
                aria-label="Yes, this page was helpful"
              >
                <ThumbsUp className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                <span>Yes</span>
              </button>
              
              <button
                onClick={() => handleFeedback('negative')}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-muted hover:border-destructive/30 transition-all text-[12px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 active:scale-95 shadow-sm hover:shadow-md"
                aria-label="No, this page was not helpful"
              >
                <ThumbsDown className="h-3.5 w-3.5 group-hover:text-destructive transition-colors" />
                <span>No</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
