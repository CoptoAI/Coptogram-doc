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
              try {
                // Defensive check for fetch property restrictions
                const fetchDescriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
                if (fetchDescriptor && fetchDescriptor.configurable) {
                  const originalFetch = window.fetch;
                  Object.defineProperty(window, 'fetch', {
                    get: function() { return originalFetch; },
                    set: function(v) { console.warn('Ignoring attempt to overwrite fetch', v); },
                    configurable: true,
                    enumerable: true
                  });
                } else if (fetchDescriptor && !fetchDescriptor.writable && !fetchDescriptor.set) {
                   console.warn('Fetch property is non-configurable and read-only. Scripts attempting to overwrite it will fail.');
                }

                // Global error mitigation for known benign issues in specific environments
                window.addEventListener('error', (event) => {
                  if (
                    event.message?.includes('Cannot set property fetch') ||
                    event.message?.includes('MetaMask') ||
                    event.message?.includes('ethereum')
                  ) {
                    // Suppress these specific environment/extension errors
                    event.preventDefault();
                    return true;
                  }
                });

                window.addEventListener('unhandledrejection', (event) => {
                  if (
                    event.reason?.message?.includes('MetaMask') || 
                    event.reason?.message?.includes('ethereum')
                  ) {
                    event.preventDefault();
                    return true;
                  }
                });
              } catch (e) {}
            `,
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
