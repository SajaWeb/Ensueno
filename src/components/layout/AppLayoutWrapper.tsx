'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ShippingBanner from '@/components/features/ShippingBanner';
import UniversalAuthModal from '@/components/auth/UniversalAuthModal';

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
        <ShippingBanner />
        <Header />
      </div>
      <main className="flex-grow z-10">{children}</main>
      <Footer />
      <UniversalAuthModal />
    </>
  );
}
