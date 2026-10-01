import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eloquencing — Herramientas',
  description: 'Las herramientas top de Eloquencing en una presentación cinematográfica.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
