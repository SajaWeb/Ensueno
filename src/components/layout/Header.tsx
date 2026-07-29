'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Sparkles, Menu, X, LogOut, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';

export default function Header() {
  const pathname = usePathname();
  const { cartCount, toastMessage, dismissToast } = useCart();
  const { currentUser, openAuthModal, logout } = useUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/#productos', label: 'Productos' },
    { href: '/tips', label: 'Tips de Sueño' },
    { href: '/perfil', label: 'Mi Perfil' },
  ];

  const logoUrl = 'https://i.postimg.cc/8Cjbdp6M/logoensuno.png';

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    window.location.href = '/';
  };

  const getUserFirstName = () => {
    if (currentUser?.profile?.fullName) {
      return currentUser.profile.fullName.split(' ')[0];
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Mamá';
  };

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

      <header className="bg-white/80 backdrop-blur-md border-b border-surface-container-high/60 transition-all sticky top-0 z-40">
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
                const isProfileLink = link.href === '/perfil';
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      if (isProfileLink && !currentUser) {
                        e.preventDefault();
                        openAuthModal('login');
                      }
                    }}
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

            {/* Actions (Cart & User Profile Button) */}
            <div className="flex items-center space-x-3">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:from-pink-500 hover:to-sky-500 text-white px-4 py-2 rounded-full font-headline font-extrabold text-xs shadow-md shadow-pink-200/50 transition-all hover:scale-105 border border-white/40 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-pink-100 fill-pink-200 animate-pulse" />
                    <span>¡Hola, {getUserFirstName()}! 💕</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 animate-scale-in text-xs font-semibold">
                      <Link
                        href="/perfil"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-purple-600" /> Mi Perfil & Datos
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors text-left font-bold border-t border-slate-100 mt-1 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="btn-ensueno-primary h-11 px-5 text-xs font-extrabold uppercase tracking-wider hidden sm:inline-flex"
                  title="Mi Cuenta & Iniciar Sesión"
                >
                  <User className="w-4 h-4 text-amber-200 animate-pulse" />
                  <span>Ingresar / Mi Cuenta</span>
                </button>
              )}

              <Link
                href="/carrito"
                className="btn-ensueno-sky h-11 px-5 text-xs font-extrabold uppercase tracking-wider relative"
              >
                <ShoppingBag className="w-4 h-4 text-sky-700" />
                <span className="hidden sm:inline">Carrito</span>
                {cartCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full animate-pulse-subtle ml-0.5">
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
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (link.href === '/perfil' && !currentUser) {
                    e.preventDefault();
                    openAuthModal('login');
                  }
                }}
                className={`block px-4 py-3 rounded-xl font-headline font-medium text-base ${
                  pathname === link.href
                    ? 'bg-primary-container/50 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión ({getUserFirstName()})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full text-center px-4 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm cursor-pointer"
              >
                Ingresar / Registrarse
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
}
