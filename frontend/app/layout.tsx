import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'ROAMEO — Roam + Experience the Originals',
  description: 'Explore local. Buy authentic. Experience the originals. Plan your journey, discover destinations, and shop from verified local artisans.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(20px)',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
