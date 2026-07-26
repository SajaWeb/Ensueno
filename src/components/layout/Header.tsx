'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Sparkles, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const { cartCount, toastMessage, dismissToast } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/#productos', label: 'Productos' },
    { href: '/tips', label: 'Tips de Sueño' },
    { href: '/perfil', label: 'Mi Perfil' },
  ];

  const logoUrl = 'https://i.postimg.cc/8Cjbdp6M/logoensuno.png';

  return (
    <>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-slow flex items-center space-x-3 bg-primary text-white px-5 py-3 rounded-full shadow-lg border border-primary-container/30">
          <Sparkles className="w-5 h-5 text-secondary-container" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={dismissToast} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-container-high/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Standalone Logo Image Only */}
            <Link href="/" className="flex items-center group">
              <Image
                src={logoUrl}
                alt="Ensueño Logo"
                width={180}
                height={60}
                priority
                className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 bg-white/80 p-1.5 rounded-full border border-surface-container-high/80 shadow-sm backdrop-blur-sm">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-6 py-2.5 rounded-full text-sm font-headline font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions (Cart & Profile) */}
            <div className="flex items-center space-x-3">
              <Link
                href="/perfil"
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors border border-surface-container-high"
                title="Mi Perfil"
              >
                <User className="w-5 h-5" />
              </Link>

              <Link
                href="/carrito"
                className="relative flex items-center space-x-2 bg-gradient-to-r from-primary-container to-secondary-container text-primary px-4 py-2.5 rounded-full font-headline font-bold text-sm transition-all squishy-button shadow-soft-glow hover:opacity-95"
              >
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="hidden sm:inline">Carrito</span>
                {cartCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-secondary text-white text-xs font-bold rounded-full animate-pulse-subtle">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-on-surface-variant hover:text-primary"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-b border-surface-container-high px-4 pt-2 pb-6 space-y-2 backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-headline font-medium text-base ${
                  pathname === link.href
                    ? 'bg-primary-container/50 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
