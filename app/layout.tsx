import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Farmer tip jar',
  description: 'A farmer can receive their tips on the Stellar blockchain now',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}