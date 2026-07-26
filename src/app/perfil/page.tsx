'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Heart, Package, Settings, Baby, Check, Sparkles, Save, ShieldAlert } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { MOCK_PRODUCTS } from '@/data/mockData';
import ProductCard from '@/components/features/ProductCard';

export default function ProfilePage() {
  const { profile, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'favoritos' | 'preferencias'>('perfil');

  // Local form state for profile editing
  const [name, setName] = useState(profile.name);
  const [babyName, setBabyName] = useState(profile.babyName);
  const [babyAgeMonths, setBabyAgeMonths] = useState(profile.babyAgeMonths);
  const [skinType, setSkinType] = useState(profile.skinType);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      babyName,
      babyAgeMonths,
      skinType,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const savedProducts = MOCK_PRODUCTS.filter((p) => (profile.savedItemIds || []).includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Hero Card */}
      <div className="bg-gradient-to-r from-primary-container/50 via-white to-secondary-container/40 rounded-3xl p-6 sm:p-8 soft-glow-card border border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-white font-headline font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-soft-glow flex-shrink-0">
            {profile.name ? profile.name.charAt(0) : 'M'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
                {profile.name}
              </h1>
              <span className="bg-secondary-container text-secondary text-[11px] font-headline font-bold px-3 py-1 rounded-full">
                MAMÁ ENSUEÑO
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Bebé: <strong className="text-primary">{profile.babyName}</strong> ({profile.babyAgeMonths} meses) • Piel: <strong className="text-secondary">{profile.skinType}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="bg-white px-4 py-2.5 rounded-2xl border text-center flex-1 sm:flex-none">
            <span className="text-xs text-outline block">Favoritos</span>
            <strong className="font-headline text-lg text-primary">{savedProducts.length}</strong>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border text-center flex-1 sm:flex-none">
            <span className="text-xs text-outline block">Pedidos</span>
            <strong className="font-headline text-lg text-secondary">2</strong>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-surface-container-high pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-headline font-bold text-xs transition-all squishy-button ${
            activeTab === 'perfil'
              ? 'bg-primary text-white shadow-soft-glow'
              : 'bg-white text-on-surface-variant hover:bg-surface-container border'
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>Perfil del Bebé</span>
        </button>

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-headline font-bold text-xs transition-all squishy-button ${
            activeTab === 'pedidos'
              ? 'bg-primary text-white shadow-soft-glow'
              : 'bg-white text-on-surface-variant hover:bg-surface-container border'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mis Pedidos</span>
        </button>

        <button
          onClick={() => setActiveTab('favoritos')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-headline font-bold text-xs transition-all squishy-button ${
            activeTab === 'favoritos'
              ? 'bg-primary text-white shadow-soft-glow'
              : 'bg-white text-on-surface-variant hover:bg-surface-container border'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Favoritos ({savedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preferencias')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-headline font-bold text-xs transition-all squishy-button ${
            activeTab === 'preferencias'
              ? 'bg-primary text-white shadow-soft-glow'
              : 'bg-white text-on-surface-variant hover:bg-surface-container border'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferencias</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'perfil' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 soft-glow-card border border-surface-container-high max-w-2xl space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-headline font-bold text-xl text-on-surface">
              Editar Datos del Bebé
            </h2>
            {savedSuccess && (
              <span className="text-xs font-bold text-primary flex items-center space-x-1 animate-pulse-subtle">
                <Check className="w-4 h-4" />
                <span>¡Cambios guardados!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-headline font-bold uppercase text-on-surface-variant mb-1.5">
                Tu Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-headline font-bold uppercase text-on-surface-variant mb-1.5">
                  Nombre de tu Bebé
                </label>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-headline font-bold uppercase text-on-surface-variant mb-1.5">
                  Edad de tu Bebé (Meses)
                </label>
                <input
                  type="number"
                  value={babyAgeMonths}
                  onChange={(e) => setBabyAgeMonths(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-headline font-bold uppercase text-on-surface-variant mb-1.5">
                Tipo de Piel Diagnóstica
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Normal', 'Sensible', 'Muy Sensible / Atópica'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSkinType(type)}
                    className={`p-3 rounded-xl text-xs font-headline font-bold text-center border transition-all ${
                      skinType === type
                        ? 'bg-secondary text-white border-secondary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container-high hover:bg-surface-container'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-primary text-white font-headline font-bold text-sm px-8 py-3.5 rounded-full squishy-button shadow-soft-glow"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 soft-glow-card border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between border-b pb-3 text-xs">
              <div>
                <span className="font-headline font-bold text-base text-on-surface block">
                  Orden #ENS-84920
                </span>
                <span className="text-outline">Realizada el 24 de Julio, 2026</span>
              </div>
              <span className="bg-primary-container/80 text-primary font-bold px-3 py-1 rounded-full">
                En Preparación
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Jabón Sueño Profundo 250ml (x2)</span>
              <strong className="text-on-surface font-headline">$49.800</strong>
            </div>
            <Link
              href="/confirmacion/ENS-84920"
              className="inline-block text-xs font-bold text-primary hover:underline"
            >
              Rastrear envío →
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'favoritos' && (
        <div>
          {savedProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-white rounded-3xl p-8 border">
              <Heart className="w-12 h-12 text-outline mx-auto" />
              <h3 className="font-headline font-bold text-lg text-on-surface">No tienes productos guardados</h3>
              <p className="text-xs text-on-surface-variant">Haz clic en el corazón de cualquier producto para guardarlo aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'preferencias' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 soft-glow-card border max-w-2xl space-y-6">
          <h2 className="font-headline font-bold text-xl text-on-surface border-b pb-3">
            Notificaciones y Recordatorios
          </h2>
          <div className="space-y-4 text-xs text-on-surface-variant">
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
              <div>
                <strong className="block text-on-surface text-sm font-headline">Recordatorio Nocturno del Baño</strong>
                <span>Recibe una notificación 30 minutos antes de la hora ideal del baño.</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
              <div>
                <strong className="block text-on-surface text-sm font-headline">Boletín Pediatría Ensueño</strong>
                <span>Nuevos tips de sueño e investigaciones sobre piel infantil.</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
