'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentResultHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const externalReference =
    searchParams.get('external_reference') ||
    searchParams.get('orderNumber') ||
    searchParams.get('preference_id') ||
    '';

  const status =
    searchParams.get('status') ||
    searchParams.get('collection_status') ||
    searchParams.get('payment') ||
    '';

  useEffect(() => {
    if (externalReference) {
      router.replace(`/confirmacion/${externalReference}?status=${status}`);
    } else {
      router.replace('/carrito');
    }
  }, [externalReference, status, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-pink-300 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-600">Procesando respuesta de MercadoPago...</p>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Cargando...</div>}>
      <PaymentResultHandler />
    </Suspense>
  );
}
