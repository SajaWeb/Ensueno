'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ShippingBanner from '@/components/features/ShippingBanner';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

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
    </>
  );
}
