import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

// Sanitization schema to allow class names and specific attributes
export const sanitizeSchema = {
  attributes: {
    '*': ['className', 'class'],
    'a': ['href', 'target', 'rel', 'className', 'class'],
    'div': ['className', 'class', 'style'],
    'p': ['className', 'class'],
    'span': ['className', 'class'],
    'blockquote': ['className', 'class'],
    'ol': ['className', 'class'],
    'ul': ['className', 'class'],
    'li': ['className', 'class'],
    'table': ['className', 'class'],
    'thead': ['className', 'class'],
    'tbody': ['className', 'class'],
    'tr': ['className', 'class'],
    'th': ['className', 'class'],
    'td': ['className', 'class'],
    'iframe': ['src', 'title', 'allow', 'allowFullScreen', 'className', 'width', 'height'],
    'video': ['src', 'controls', 'className', 'playsInline', 'width', 'height', 'poster']
  }
};

export const defaultMarkdownPlugins = [
  remarkGfm,
  rehypeRaw,
  [rehypeSanitize, sanitizeSchema]
];
