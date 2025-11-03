import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Omnius株式会社',
  description: 'AI教育とDX支援で、可能性を最大化',
  keywords: [
    'Omnius',
    'AI教育',
    'DX支援',
    '研修',
    'コンサルティング',
    'システム開発',
    'インターン',
  ],
  authors: [{ name: 'Omnius株式会社' }],
  creator: 'Omnius株式会社',
  publisher: 'Omnius株式会社',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://omnius.co.jp',
    siteName: 'Omnius株式会社',
    title: 'Omnius株式会社',
    description: 'AI教育とDX支援で、可能性を最大化',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Omnius株式会社',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omnius株式会社',
    description: 'AI教育とDX支援で、可能性を最大化',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://omnius.co.jp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
