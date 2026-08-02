'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';

const LOGO_URL = 'https://i.postimg.cc/8Cjbdp6M/logoensuno.png';

/** Los tres SKU reales, para el mega-menú. */
const PRODUCT_LINKS = [
  {
    href: '/productos/panitos-humedos',
    label: 'Pañitos Húmedos',
    blurb: 'Algodón orgánico y manzanilla',
  },
  {
    href: '/productos/colonia-ensueno',
    label: 'Colonia',
    blurb: 'Sin alcohol, flor de azahar',
  },
  {
    href: '/productos/mantequilla-corporal-ensueno',
    label: 'Mantequilla Corporal',
    blurb: 'Avena coloidal y karité',
  },
];

export default function Header() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { currentUser, openAuthModal, logout } = useUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const productsNavRef = useRef<HTMLDivElement>(null);
  // El panel se renderiza fuera de productsNavRef (va anclado al <header> a
  // ancho completo), así que necesita su propia ref: si no, el manejador de
  // clic-fuera lo cerraba en `mousedown` y el enlace nunca llegaba a navegar.
  const megaPanelRef = useRef<HTMLDivElement>(null);

  // Cerrar los desplegables al hacer clic fuera o al pulsar Escape.
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
      const inTrigger = productsNavRef.current?.contains(target);
      const inPanel = megaPanelRef.current?.contains(target);
      if (!inTrigger && !inPanel) {
        setMegaOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
        setMegaOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Cerrar todo al navegar.
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/tips', label: 'Tips de Sueño' },
    { href: '/perfil', label: 'Mi Perfil' },
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    window.location.href = '/';
  };

  const getUserFirstName = () => {
    if (currentUser?.profile?.fullName) return currentUser.profile.fullName.split(' ')[0];
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Mamá';
  };

  const linkClass = (href: string) =>
    `px-4 py-2 rounded-full text-sm font-bold transition-colors ens-focus ${
      pathname === href ? 'bg-celeste text-tinta' : 'text-tinta-suave hover:text-azul'
    }`;

  return (
    <header className="relative z-40 bg-white border-b border-borde">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          <Link href="/" className="flex items-center shrink-0 ens-focus" aria-label="Ensueño, inicio">
            <Image
              src={LOGO_URL}
              alt="Ensueño"
              width={180}
              height={60}
              priority
              className="h-11 sm:h-14 w-auto object-contain"
            />
          </Link>

          {/* Navegación de escritorio */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Principal">
            <Link href="/" className={linkClass('/')}>
              Inicio
            </Link>

            {/* Productos: mega-menú */}
            <div ref={productsNavRef} className="relative">
              <button
                type="button"
                onClick={() => setMegaOpen((v) => !v)}
                aria-expanded={megaOpen}
                aria-controls="mega-productos"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-tinta-suave hover:text-azul transition-colors ens-focus"
              >
                Productos
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${megaOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>

            <Link href="/tips" className={linkClass('/tips')}>
              Tips de Sueño
            </Link>
            <Link
              href="/perfil"
              onClick={(e) => {
                if (!currentUser) {
                  e.preventDefault();
                  openAuthModal('login');
                }
              }}
              className={linkClass('/perfil')}
            >
              Mi Perfil
            </Link>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  aria-expanded={userDropdownOpen}
                  className="flex items-center gap-2 px-3 sm:px-4 h-10 rounded-full border-2 border-borde text-tinta font-bold text-xs hover:border-azul transition-colors ens-focus"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Hola, {getUserFirstName()}</span>
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-borde shadow-lg py-2 z-50 animate-scale-in">
                    <Link
                      href="/perfil"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-tinta hover:bg-cian transition-colors"
                    >
                      <User className="w-4 h-4 text-azul" aria-hidden="true" /> Mi perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-secondary hover:bg-cian transition-colors text-left border-t border-borde mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden sm:inline-flex ens-btn ens-btn--linea h-10 text-xs px-5"
              >
                Ingresar
              </button>
            )}

            {/* Carrito. El contador va posicionado en absoluto sobre el botón. */}
            <Link
              href="/carrito"
              className="relative ens-btn ens-btn--azul h-10 px-4 sm:px-5 text-xs"
              aria-label={
                cartCount > 0
                  ? `Carrito, ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`
                  : 'Carrito, vacío'
              }
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 grid place-items-center rounded-full bg-secondary text-white text-[11px] font-bold leading-none ring-2 ring-white"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="md:hidden p-2 -mr-2 text-tinta ens-focus"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/*
        Panel del mega-menú anclado al <header> a ancho completo, NO dentro del
        contenedor max-w-7xl: `body { overflow-x: hidden }` recortaría el panel.
      */}
      {megaOpen && (
        <div
          ref={megaPanelRef}
          id="mega-productos"
          className="hidden md:block absolute left-0 right-0 top-full bg-white border-y border-borde shadow-lg animate-fade-in"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="ens-eyebrow text-tinta-suave mb-5">Catálogo Ensueño</p>
            <ul className="grid grid-cols-3 gap-4">
              {PRODUCT_LINKS.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="block p-4 rounded-2xl border border-borde hover:border-azul hover:bg-cian transition-colors ens-focus"
                  >
                    <span className="block font-display text-lg text-tinta">{p.label}</span>
                    <span className="block mt-1 text-sm text-tinta-suave">{p.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Navegación móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-borde px-4 pt-3 pb-6 space-y-1">
          {[{ href: '/', label: 'Inicio' }, ...PRODUCT_LINKS.map((p) => ({ href: p.href, label: p.label })), ...navLinks.slice(1)].map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (link.href === '/perfil' && !currentUser) {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }
                }}
                className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                  pathname === link.href
                    ? 'bg-celeste text-tinta'
                    : 'text-tinta-suave hover:bg-cian'
                }`}
              >
                {link.label}
              </Link>
            )
          )}

          {currentUser ? (
            <button
              onClick={handleLogout}
              className="w-full ens-btn ens-btn--linea mt-3"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" /> Cerrar sesión
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('login');
              }}
              className="w-full ens-btn ens-btn--azul mt-3"
            >
              Ingresar
            </button>
          )}
        </div>
      )}
    </header>
  );
}
