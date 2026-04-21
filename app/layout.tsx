import type {Metadata} from 'next';
import { Cairo, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';
import './globals.css';

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Coptogram Documentation',
  description: 'The complete guide to the Coptogram Platform',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cairo.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Resource Hints for Performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="anonymous" />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}

        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="microsoft-clarity" strategy="lazyOnload">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
            `}
          </Script>
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
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
