import { Inter, JetBrains_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans antialiased" suppressHydrationWarning>
        <RootProvider>
          <div suppressHydrationWarning className="flex flex-col min-h-screen">
            {children}
          </div>
        </RootProvider>
      </body>
    </html>
  );
}





