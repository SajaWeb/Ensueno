'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShieldCheck, Moon, Award } from 'lucide-react';

import { useUser } from '@/context/UserContext';

export default function Footer() {
  const { currentUser, openAuthModal } = useUser();
  const logoUrl = 'https://i.postimg.cc/8Cjbdp6M/logoensuno.png';

  return (
    <footer className="bg-white/60 border-t border-surface-container-high/60 pt-16 pb-12 relative overflow-hidden mt-20 backdrop-blur-md">
      {/* Decorative Cloud Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-12 bg-white/80 rounded-b-full opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-surface-container-high text-center">
          <div className="flex flex-col items-center space-y-2 p-4 bg-white/80 rounded-3xl border border-surface-container-high/80 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <span className="font-headline font-bold text-sm text-on-surface">100% Hipoalergénico</span>
            <span className="text-xs text-on-surface-variant">Libre de sulfatos y parabenos</span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 bg-white/80 rounded-3xl border border-surface-container-high/80 shadow-sm">
            <Award className="w-8 h-8 text-secondary" />
            <span className="font-headline font-bold text-sm text-on-surface">Probado Dermatológicamente</span>
            <span className="text-xs text-on-surface-variant">Aprobado por pediatras</span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 bg-white/80 rounded-3xl border border-surface-container-high/80 shadow-sm">
            <Moon className="w-8 h-8 text-tertiary" />
            <span className="font-headline font-bold text-sm text-on-surface">3 Esenciales Únicos</span>
            <span className="text-xs text-on-surface-variant">Pañitos, Colonia y Cremas</span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 bg-white/80 rounded-3xl border border-surface-container-high/80 shadow-sm">
            <Heart className="w-8 h-8 text-secondary" />
            <span className="font-headline font-bold text-sm text-on-surface">Cuidado con Amor</span>
            <span className="text-xs text-on-surface-variant">Hecho especialmente para tu bebé</span>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={logoUrl}
                alt="Ensueño Logo"
                width={160}
                height={52}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              El cuidado más tierno para tu bebé. Tres productos esenciales elaborados con fórmulas pediátricas hipoalergénicas.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-headline font-bold text-base text-on-surface mb-4">Nuestros Productos</h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li>
                <Link href="/productos/panitos-humedos" className="hover:text-primary transition-colors">Pañitos Húmedos</Link>
              </li>
              <li>
                <Link href="/productos/colonia-ensueno" className="hover:text-primary transition-colors">Colonia Ensueño</Link>
              </li>
              <li>
                <Link href="/productos/crema-corporal-ensueno" className="hover:text-primary transition-colors">Cremas Corporales</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-headline font-bold text-base text-on-surface mb-4">Explora & Legal</h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li><Link href="/" className="hover:text-primary transition-colors">Inicio Funnel</Link></li>
              <li><Link href="/tips" className="hover:text-primary transition-colors">Guías y Tips de Sueño</Link></li>
              <li>
                <Link
                  href="/perfil"
                  onClick={(e) => {
                    if (!currentUser) {
                      e.preventDefault();
                      openAuthModal('login');
                    }
                  }}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Mi Perfil y Pedidos
                </Link>
              </li>
              <li>
                <Link href="/politica-tratamiento-datos" className="hover:text-primary transition-colors font-medium">
                  Política Tratamiento de Datos
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-headline font-bold text-base text-on-surface mb-4">Únete al Club Ensueño</h4>
            <p className="text-xs text-on-surface-variant mb-3">
              Recibe consejos semanales de expertos en sueño infantil y cupones exclusivos.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="w-full px-4 py-2.5 rounded-full text-xs bg-white border border-surface-container-high focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-primary-container hover:text-primary transition-colors"
              >
                Unirme
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-surface-container-high/60 flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant gap-4">
          <p>© {new Date().getFullYear()} Ensueño Baby. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/politica-tratamiento-datos" className="hover:text-primary transition-colors underline font-medium">
              Política de Tratamiento de Datos (Habeas Data)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
