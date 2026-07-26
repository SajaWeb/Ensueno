import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { UserProvider } from '@/context/UserContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ParticleBackground from '@/components/layout/ParticleBackground';

export const metadata: Metadata = {
  title: 'Ensueño | Cuidado Natural y Sueño Profundo para tu Bebé',
  description:
    'E-Commerce de cosmética hipoalergénica infantil con fórmulas de lavanda, manzanilla y avena para el descanso perfecto de tu bebé.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <body className="min-h-screen flex flex-col bg-surface text-on-surface antialiased relative">
        <CartProvider>
          <UserProvider>
            <ParticleBackground />
            <Header />
            <main className="flex-grow z-10">{children}</main>
            <Footer />
          </UserProvider>
        </CartProvider>
      </body>
    </html>
  );
}
