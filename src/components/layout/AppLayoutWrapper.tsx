'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ShippingBanner from '@/components/features/ShippingBanner';
import UniversalAuthModal from '@/components/auth/UniversalAuthModal';
import CartToast from '@/components/layout/CartToast';
import MobileOfferModal from '@/components/features/MobileOfferModal';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Automatic scroll-to-top on route change to prevent landing mid-page or under sticky header
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }
    }
  }, [pathname]);

  if (isAdminRoute) {
    return <main className="flex-grow z-10">{children}</main>;
  }

  return (
    <>
      <div className="sticky top-0 z-40">
        {/* En móvil la barra se sustituye por MobileOfferModal: ocupaba altura
            del chrome pegajoso en todas las páginas. */}
        <div className="hidden sm:block">
          <ShippingBanner />
        </div>
        <Header />
      </div>
      {/* Sin `z-10`: creaba un contexto de apilamiento que encerraba a los
          overlays de las páginas (visor de imagen, lector de tips) por debajo
          del header. Existía para quedar sobre el canvas de partículas, que ya
          no está. */}
      <main className="flex-grow">{children}</main>
      <Footer />
      <UniversalAuthModal />
      <CartToast />
      <MobileOfferModal />
    </>
  );
}
