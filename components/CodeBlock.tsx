'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Check, Copy } from 'lucide-react';
import * as React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'typescript' }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-md border border-border bg-[#010409]">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest border-b border-border bg-muted/20">
        <span>{language}</span>
        <button
          onClick={copyToClipboard}
          className="rounded-md p-1 hover:bg-muted transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.25rem',
          fontSize: '13px',
          lineHeight: '1.6',
          backgroundColor: 'transparent',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
