import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { DEFAULT_THEME, themeClassName, themeInitScript } from '@/lib/theme';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TaskFlow — Personal Task Manager',
  description: 'A personal task tracking app. Create, manage, and track your tasks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={themeClassName(DEFAULT_THEME)}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the saved theme before first paint. Keeps pages static. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-surface-bg text-foreground`}>
        {children}
      </body>
    </html>
  );
}
