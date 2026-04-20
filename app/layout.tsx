import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Coptogram Documentation',
  description: 'The complete guide to the Coptogram Platform',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Prevent polyfills from crashing the app by trying to overwrite window.fetch
                // which is protected in some iframe environments like AI Studio.
                if (typeof window !== 'undefined') {
                  const originalFetch = window.fetch;
                  try {
                    Object.defineProperty(window, 'fetch', {
                      get: function() { return originalFetch; },
                      set: function() { 
                        console.warn('Blocked an attempt to overwrite window.fetch with a polyfill.');
                      },
                      configurable: true
                    });
                  } catch (e) {
                    // If defineProperty fails, we can't do much, but at least we tried.
                    console.error('Fetch protection failed:', e);
                  }
                }
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
