'use client';

import * as React from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2, Loader2, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FeedbackProps {
  language?: 'en' | 'ar';
  sectionId?: string;
  itemId?: string | null;
}

export function Feedback({ language = 'en', sectionId, itemId }: FeedbackProps) {
  const [feedback, setFeedback] = React.useState<'positive' | 'negative' | null>(null);
  const [isExpanding, setIsExpanding] = React.useState(false);
  const [detail, setDetail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDone, setIsDone] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (isSubmitting) return;
    setErrorMsg(null);
    setFeedback(type);
    if (type === 'positive') {
      await submitFeedback(type, '');
    } else {
      setIsExpanding(true);
    }
  };

  const submitFeedback = async (type: 'positive' | 'negative', comment: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await addDoc(collection(db, 'feedback'), {
        type,
        comment,
        sectionId: sectionId || 'none',
        itemId: itemId || 'none',
        language,
        timestamp: serverTimestamp(),
        page: window.location.href
      });
      setIsDone(true);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      setErrorMsg(language === 'ar' ? 'فشل إرسال التعليقات. يرجى المحاولة مرة أخرى.' : 'Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const strings = {
    thanks: language === 'ar' ? 'شكراً على تعليقاتك! يساعدنا ذلك في تحسين التوثيق.' : 'Thanks for your feedback! It helps us improve the documentation.',
    helpful: language === 'ar' ? 'هل كانت هذه الصفحة مفيدة؟' : 'Was this page helpful?',
    better: language === 'ar' ? 'تساعدنا تعليقاتك في جعل كوبتوجرام أفضل للجميع.' : 'Your feedback helps us make Coptogram better for everyone.',
    yes: language === 'ar' ? 'نعم' : 'Yes',
    no: language === 'ar' ? 'لا' : 'No',
    yesAria: language === 'ar' ? 'نعم، كانت هذه الصفحة مفيدة' : 'Yes, this page was helpful',
    noAria: language === 'ar' ? 'لا، لم تكن هذه الصفحة مفيدة' : 'No, this page was not helpful',
    placeholder: language === 'ar' ? 'ما الخطأ أو ما الذي يمكن تحسينه؟ (اختياري)' : 'What went wrong or what can be improved? (optional)',
    submit: language === 'ar' ? 'إرسال' : 'Submit',
    error: language === 'ar' ? 'خطأ' : 'Error',
  };

  return (
    <div className="mt-16 pt-8 border-t border-border/60 max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="thanks"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 py-6 px-8 rounded-2xl bg-primary/5 border border-primary/20 text-primary"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">{strings.thanks}</span>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div role="alert" aria-live="assertive">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errorMsg}
                </motion.div>
              )}
            </div>
            
            {isExpanding ? (
              <motion.div
                key="details"
                role="group"
                aria-label={language === 'ar' ? 'نموذج ملاحظات مفصل' : 'Detailed feedback form'}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 py-4"
              >
            <div className="space-y-1">
              <h4 className="text-[14px] font-semibold text-foreground">{strings.helpful}</h4>
              <p className="text-[12px] text-muted-foreground">{strings.better}</p>
            </div>
            
                <textarea
                  className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-inner"
                  placeholder={strings.placeholder}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  disabled={isSubmitting}
                  aria-label={strings.placeholder}
                />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsExpanding(false); setFeedback(null); }}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                disabled={isSubmitting}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => submitFeedback('negative', detail)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {strings.submit}
              </button>
            </div>
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
              <h4 className="text-[14px] font-semibold text-foreground">{strings.helpful}</h4>
              <p className="text-[12px] text-muted-foreground">{strings.better}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback('positive')}
                disabled={isSubmitting}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all text-[12px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50"
                aria-label={strings.yesAria}
              >
                {isSubmitting && feedback === 'positive' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <ThumbsUp className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                )}
                <span>{strings.yes}</span>
              </button>
              
              <button
                onClick={() => handleFeedback('negative')}
                disabled={isSubmitting}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-muted hover:border-destructive/30 transition-all text-[12px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50"
                aria-label={strings.noAria}
              >
                <ThumbsDown className="h-3.5 w-3.5 group-hover:text-destructive transition-colors" />
                <span>{strings.no}</span>
              </button>
            </div>
          </motion.div>
        )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
