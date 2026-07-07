import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Post 2 Post',
  description: 'Social Media Scheduler & AI Content Creator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f0f4fa]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
