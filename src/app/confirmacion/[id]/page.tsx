'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Truck,
  PackageCheck,
  MapPin,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

function ConfirmationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const id = (params.id as string) || searchParams.get('external_reference') || '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  // MercadoPago return query params
  const statusParam = (searchParams.get('status') || searchParams.get('collection_status') || '').toLowerCase();
  const paymentParam = (searchParams.get('payment') || '').toLowerCase();
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || '';

  // Determine overall payment outcome from params & order status (approved takes precedence)
  const isApproved =
    statusParam === 'approved' ||
    statusParam === 'success' ||
    order?.status === 'confirmado' ||
    order?.paymentStatus === 'approved';

  const isRejected =
    !isApproved &&
    (statusParam === 'rejected' ||
      statusParam === 'failure' ||
      paymentParam === 'failure' ||
      order?.status === 'anulada' ||
      order?.paymentStatus === 'rejected' ||
      order?.paymentStatus === 'expired');

  const isPending =
    !isApproved &&
    !isRejected &&
    (statusParam === 'pending' ||
      statusParam === 'in_process' ||
      order?.status === 'orden_generada');

  useEffect(() => {
    if (isApproved) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f472b6', '#c084fc', '#38bdf8', '#fef08a'],
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }

    if (id) {
      setLoading(true);
      const queryStr = new URLSearchParams({
        orderNumber: id,
        ...(statusParam ? { status: statusParam } : {}),
        ...(paymentId ? { payment_id: paymentId } : {}),
      }).toString();

      fetch(`/api/v1/orders?${queryStr}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setOrder(json.data);
          }
        })
        .catch((err) => console.error('Error cargando orden:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, statusParam, paymentId, isApproved]);

  const handleRetryPayment = async () => {
    const targetOrderNumber = order?.orderNumber || id;
    if (!targetOrderNumber) return;

    setRetrying(true);
    showToast('Generando nueva sesión de pago con MercadoPago...', 'info');

    try {
      const res = await fetch('/api/v1/payments/mercadopago/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: targetOrderNumber }),
      });
      const json = await res.json();

      if (json.success && json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
      } else {
        showToast(json.error || 'No se pudo generar la pasarela de pago.', 'error');
        setRetrying(false);
      }
    } catch (err: any) {
      showToast('Error al conectar con la pasarela de pago.', 'error');
      setRetrying(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-borde border-t-azul rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-tinta-suave">Cargando estado del pedido...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Dynamic Status Banner */}
      {isRejected ? (
        // STATE 1: REJECTED / FAILURE
        <div className="bg-cian border border-secondary rounded-3xl p-6 sm:p-8 space-y-5 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-cian text-secondary flex items-center justify-center text-3xl shadow-sm">
            <ShieldAlert className="w-9 h-9 text-secondary" />
          </div>
          <div>
            <span className="inline-block bg-cian text-secondary font-extrabold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
              Pago Rechazado o Incompleto
            </span>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-tinta">
              No pudimos procesar tu pago con MercadoPago 💔
            </h1>
            <p className="text-tinta-suave text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
              La transacción fue rechazada por la entidad bancaria, fondos insuficientes o cancelada durante el proceso. Tu orden de compra{' '}
              <strong className="font-mono text-azul">#{order?.orderNumber || id}</strong> sigue registrada.
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-secondary max-w-md mx-auto text-left text-xs space-y-1.5 text-tinta-suave">
            <div className="flex justify-between font-semibold">
              <span>Referencia de Orden:</span>
              <span className="font-mono text-azul">#{order?.orderNumber || id}</span>
            </div>
            {paymentId && (
              <div className="flex justify-between text-tinta-suave">
                <span>ID Transacción MercadoPago:</span>
                <span className="font-mono">{paymentId}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-borde pt-1.5 mt-1.5">
              <span>Total a Pagar:</span>
              <span className="text-azul font-bold">{formatPrice(order?.total)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              isLoading={retrying}
              onClick={handleRetryPayment}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Reintentar Pago con MercadoPago
            </Button>

            <Link href="/carrito">
              <Button variant="white" size="lg" leftIcon={<ShoppingBag className="w-4 h-4" />}>
                Volver al Carrito
              </Button>
            </Link>
          </div>
        </div>
      ) : isPending ? (
        // STATE 2: PENDING / VERIFICATION
        <div className="bg-amarillo border border-borde rounded-3xl p-6 sm:p-8 space-y-5 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-amarillo text-tertiary flex items-center justify-center text-3xl shadow-sm">
            <Clock className="w-9 h-9 text-tertiary animate-pulse" />
          </div>
          <div>
            <span className="inline-block bg-amarillo text-tinta font-extrabold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
              Pago en Verificación
            </span>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-tinta">
              MercadoPago está verificando tu transacción ⏳
            </h1>
            <p className="text-tinta-suave text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
              Si realizaste el pago por PSE, Efecty o transferencia bancaria, MercadoPago puede demorar unos minutos en confirmar el pago. Te notificaremos por correo electrónico apenas sea aprobado.
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 bg-white px-5 py-2.5 rounded-full border border-borde shadow-sm font-extrabold text-xs text-tinta-suave">
            <span>Número de Orden:</span>
            <span className="text-azul font-mono">#{order?.orderNumber || id}</span>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link href="/perfil">
              <Button variant="secondary" size="md">
                Ver Estado en Mi Perfil
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        // STATE 3: APPROVED / SUCCESS
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-cian flex items-center justify-center text-primary text-3xl shadow-md border border-white">
            ✨
          </div>
          <span className="inline-block bg-cian text-azul font-headline font-extrabold text-xs px-4 py-1.5 rounded-full border border-borde">
            ¡PAGO APROBADO Y CONFIRMADO!
          </span>
          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-tinta">
            ¡Gracias por tu compra en Ensueño! ☁️
          </h1>
          <p className="text-tinta-suave text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Hemos enviado la confirmación y recibo de compra a tu correo electrónico. Tu pedido se encuentra en preparación.
          </p>
          <div className="inline-flex items-center space-x-2 bg-white px-5 py-2.5 rounded-full border border-borde shadow-sm font-headline font-extrabold text-xs text-tinta-suave">
            <span>Número de Orden:</span>
            <span className="text-azul font-mono tracking-wider">#{order?.orderNumber || id}</span>
          </div>
        </div>
      )}

      {/* Progress Timeline Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 soft-glow-card border border-borde space-y-6">
        <div className="flex flex-col items-center justify-center space-y-1">
          <h2 className="font-headline font-bold text-base text-tinta text-center">
            Estado del Envío en Tiempo Real
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border bg-cian text-azul border-borde">
            <span>Estado:</span>
            <strong className="text-azul font-black">
              {order?.status === 'orden_generada'
                ? '1. Orden Generada (Pendiente Pago)'
                : order?.status === 'confirmado'
                ? '1. Pago Aprobado'
                : order?.status === 'empacada'
                ? '2. Empacada'
                : order?.status === 'en_camino'
                ? '3. En Camino'
                : order?.status === 'sin_poder_entregarse'
                ? '⚠️ Novedad en Entrega'
                : order?.status === 'entregada'
                ? '4. Entregada'
                : order?.status === 'anulada'
                ? '❌ Pago Rechazado / Cancelada'
                : '1. Confirmado'}
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {/* Step 1: Confirmado / Orden Generada */}
          <div
            className={`flex flex-col items-center text-center space-y-2 relative z-10 transition-all ${
              !isRejected ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                isRejected
                  ? 'bg-cian text-secondary'
                  : isApproved
                  ? 'bg-azul text-white'
                  : 'bg-tertiary text-white shadow-md'
              }`}
            >
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-xs text-tinta">1. Confirmación</span>
            <span className="text-[10px] text-tinta-suave">
              {isRejected ? 'Pago Rechazado' : isPending ? 'Pago en Proceso' : 'Pago Aprobado'}
            </span>
          </div>

          {/* Step 2: Empacada */}
          <div
            className={`flex flex-col items-center text-center space-y-2 relative z-10 transition-all ${
              (order?.statusStep || 1) >= 2 ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                (order?.statusStep || 1) >= 2 ? 'bg-azul text-white' : 'bg-cian text-tinta-suave'
              }`}
            >
              <PackageCheck className="w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-xs text-tinta">2. Empacada</span>
            <span className="text-[10px] text-tinta-suave">Empaque Cuidado</span>
          </div>

          {/* Step 3: En Camino */}
          <div
            className={`flex flex-col items-center text-center space-y-2 relative z-10 transition-all ${
              (order?.statusStep || 1) >= 3 ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                order?.status === 'sin_poder_entregarse'
                  ? 'bg-tertiary text-white shadow-md animate-pulse'
                  : (order?.statusStep || 1) >= 3
                  ? 'bg-azul text-white'
                  : 'bg-cian text-tinta-suave'
              }`}
            >
              <Truck className="w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-xs text-tinta">
              {order?.status === 'sin_poder_entregarse' ? 'Novedad Entrega' : '3. En Camino'}
            </span>
            <span className="text-[10px] text-tinta-suave">
              {order?.status === 'sin_poder_entregarse' ? 'Verificar Dirección' : 'Despacho Servientrega'}
            </span>
          </div>

          {/* Step 4: Entregado */}
          <div
            className={`flex flex-col items-center text-center space-y-2 relative z-10 transition-all ${
              (order?.statusStep || 1) >= 4 ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                order?.status === 'devolucion'
                  ? 'bg-secondary text-white shadow-md'
                  : (order?.statusStep || 1) >= 4
                  ? 'bg-azul text-white'
                  : 'bg-cian text-tinta-suave'
              }`}
            >
              <MapPin className="w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-xs text-tinta">
              {order?.status === 'devolucion' ? 'Devolución' : '4. Entregado'}
            </span>
            <span className="text-[10px] text-tinta-suave">
              {order?.status === 'devolucion' ? 'Retorno a Taller' : 'En tu Hogar'}
            </span>
          </div>
        </div>

        <div className="bg-cian p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-xs text-tinta-suave gap-2 border border-borde">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-azul" />
            <span>Entrega Estimada: <strong>{order?.deliveryEstimate || '2 - 4 días hábiles'}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-azul" />
            <span>Horario de Entrega: <strong>8:00 AM - 6:00 PM</strong></span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 soft-glow-card border border-borde space-y-4">
          <h3 className="font-headline font-bold text-base text-tinta border-b border-borde pb-3">
            Detalles de la Orden
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-tinta-suave">
            <div>
              <span className="font-semibold block text-tinta-suave mb-1 uppercase text-[10px]">Destinatario:</span>
              <p className="font-bold text-tinta">{order.customerName || 'Cliente Ensueño'}</p>
              <p>{order.customerEmail || ''}</p>
              {order.customerPhone && <p>Tel: {order.customerPhone}</p>}
            </div>
            <div>
              <span className="font-semibold block text-tinta-suave mb-1 uppercase text-[10px]">Dirección de Envío:</span>
              <p className="font-bold text-tinta">{order.shippingAddress || 'Dirección de Entrega'}</p>
              <p>{order.city ? `${order.city}, ${order.department || 'Colombia'}` : 'Colombia'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link href="/perfil">
          <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Ver Mi Historial en Perfil
          </Button>
        </Link>
        <Link href="/">
          <Button variant="white" size="lg">
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-tinta-suave">Cargando...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
