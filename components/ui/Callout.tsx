import * as React from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalloutProps {
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export function Callout({ children, type = 'info' }: CalloutProps) {
  const icons = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  };

  const styles = {
    info: 'bg-blue-500/5 border-blue-500/20 text-blue-900 dark:text-blue-200',
    warning: 'bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-200',
    error: 'bg-red-500/5 border-red-500/20 text-red-900 dark:text-red-200',
    success: 'bg-green-500/5 border-green-500/20 text-green-900 dark:text-green-200',
  };

  return (
    <div className={cn('my-6 p-4 rounded-xl border flex items-start gap-3 shadow-sm', styles[type])}>
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
