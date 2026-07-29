import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { UserProvider } from '@/context/UserContext';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';
import { ToastProvider } from '@/context/ToastContext';
import ParticleBackground from '@/components/layout/ParticleBackground';
import MetaPixel from '@/components/analytics/MetaPixel';

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
        <ToastProvider>
          <CartProvider>
            <UserProvider>
              <MetaPixel />
              <ParticleBackground />
              <AppLayoutWrapper>{children}</AppLayoutWrapper>
            </UserProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
