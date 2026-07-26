'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { CheckCircle2, Truck, PackageCheck, MapPin, ArrowRight, Sparkles, Clock, Calendar } from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = (params.id as string) || 'ENS-84920';

  useEffect(() => {
    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a2d2ff', '#fec1d0', '#e3cb87', '#30628a'],
      });
    } catch (e) {
      console.error('Confetti error:', e);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary-container flex items-center justify-center text-primary text-3xl shadow-soft-glow animate-bounce-slow">
          ✨
        </div>
        <span className="inline-block bg-secondary-container/60 text-secondary font-headline font-bold text-xs px-4 py-1.5 rounded-full">
          ¡PEDIDO RECIBIDO CON ÉXITO!
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
          ¡Gracias por tu compra en Ensueño! ☁️
        </h1>
        <p className="text-on-surface-variant text-sm max-w-md mx-auto">
          Hemos enviado la confirmación y recibo de compra a tu correo electrónico. Tu pedido ya se encuentra en nuestro taller.
        </p>
        <div className="inline-flex items-center space-x-2 bg-white px-5 py-2.5 rounded-full border border-surface-container-high shadow-sm font-headline font-bold text-sm text-primary">
          <span>Número de Orden:</span>
          <span className="text-secondary font-mono tracking-wider">#{id}</span>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 soft-glow-card border border-surface-container-high space-y-6">
        <h2 className="font-headline font-bold text-lg text-on-surface text-center">
          Estado del Envío en Tiempo Real
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-2 relative z-10">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-soft-glow">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-xs text-on-surface">1. Confirmado</span>
            <span className="text-[10px] text-outline">Pago Aprobado</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-2 relative z-10">
            <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold border-2 border-primary">
              <PackageCheck className="w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-xs text-primary">2. Preparando</span>
            <span className="text-[10px] text-outline">Empaque Cuidado</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-2 opacity-60">
            <div className="w-12 h-12 rounded-full bg-surface-container-low text-outline flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-xs text-on-surface">3. En Camino</span>
            <span className="text-[10px] text-outline">Despacho Servientrega</span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center space-y-2 opacity-60">
            <div className="w-12 h-12 rounded-full bg-surface-container-low text-outline flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="font-headline font-bold text-xs text-on-surface">4. Entregado</span>
            <span className="text-[10px] text-outline">En tu Hogar</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant gap-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Entrega Estimada: <strong>2 - 3 días hábiles</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-secondary" />
            <span>Horario de Entrega: <strong>8:00 AM - 6:00 PM</strong></span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 soft-glow-card border border-surface-container-high space-y-4">
        <h3 className="font-headline font-bold text-base text-on-surface border-b pb-3">
          Detalles de Entrega
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface-variant">
          <div>
            <span className="font-semibold block text-on-surface mb-1">Destinatario:</span>
            <p>María Alejandra Morales</p>
            <p>Tel: +57 310 456 7890</p>
          </div>
          <div>
            <span className="font-semibold block text-on-surface mb-1">Dirección de Envío:</span>
            <p>Calle 127 # 14-45, Apto 502</p>
            <p>Bogotá, Colombia</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/perfil"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-primary text-white font-headline font-bold text-sm px-8 py-4 rounded-full squishy-button shadow-soft-glow"
        >
          <span>Ver mi Historial en Perfil</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white text-on-surface border border-surface-container-high font-headline font-bold text-sm px-6 py-4 rounded-full shadow-sm hover:bg-surface-container-low"
        >
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
}
