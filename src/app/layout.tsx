import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Christmas Gift Exchange | Family Wishlist',
  description: 'A magical Christmas gift exchange platform for the family',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              border: '2px solid #F59E0B',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
            },
          }}
        />
      </body>
    </html>
  );
}
