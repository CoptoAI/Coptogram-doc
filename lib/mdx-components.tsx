import React from 'react';
import { Callout } from '@/components/ui/Callout';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/CodeBlock';

// Define the components used in MDX
export const mdxComponents = {
  // Custom Components
  Callout,
  
  // Custom Interactive Components example
  Button: ({ children, href, className, variant = 'primary' }: any) => (
    <a 
      href={href} 
      className={cn(
        "inline-flex items-center justify-center px-6 py-2 rounded-lg font-bold transition-all active:scale-95 my-4",
        variant === 'primary' 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90" 
          : "border-2 border-primary text-primary hover:bg-primary/5",
        className
      )}
    >
      {children}
    </a>
  ),
  
  Video: ({ src, title }: any) => (
    <div className="relative aspect-video w-full my-8 overflow-hidden rounded-xl border border-border bg-black shadow-lg">
      <iframe
        src={src}
        title={title || "Video Player"}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  ),

  // HTML Tag Mappings
  h1: ({ children }: any) => <h1 className="text-3xl font-bold tracking-tight mb-4">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-2xl font-bold tracking-tight mt-10 mb-4 border-b pb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-xl font-bold tracking-tight mt-8 mb-3">{children}</h3>,
  p: ({ children }: any) => <p className="leading-7 mb-4 last:mb-0 text-muted-foreground">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground">{children}</ol>,
  li: ({ children }: any) => <li className="leading-normal">{children}</li>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-muted-foreground my-6 bg-primary/5 px-4 rounded-r-lg">
      {children}
    </blockquote>
  ),
  code: ({ children, className }: any) => {
    const isInline = !className;
    if (isInline) {
      return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">{children}</code>;
    }
    return <CodeBlock code={children.toString()} language={className.replace('language-', '')} />;
  },
  pre: ({ children }: any) => <div className="my-6">{children}</div>,
  table: ({ children }: any) => (
    <div className="w-full overflow-x-auto my-8 border rounded-xl">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-muted border-b">{children}</thead>,
  th: ({ children }: any) => <th className="px-4 py-3 text-left font-bold">{children}</th>,
  td: ({ children }: any) => <td className="px-4 py-3 border-t">{children}</td>,
  hr: () => <hr className="my-8 border-border" />,
};
