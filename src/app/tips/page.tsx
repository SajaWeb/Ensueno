'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, BookOpen, Clock, User, X, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { Tip } from '@/types';
import { apiService } from '@/services/api';

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTip, setActiveTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTips() {
      setLoading(true);
      try {
        const data = await apiService.getTips(selectedCategory, searchQuery);
        setTips(data);
      } catch (e) {
        console.error('Error fetching tips:', e);
      } finally {
        setLoading(false);
      }
    }
    loadTips();
  }, [selectedCategory, searchQuery]);

  const categories = [
    { id: 'todos', label: 'Todos los Tips', icon: '✨' },
    { id: 'sueno', label: 'Sueño Infantil', icon: '🌙' },
    { id: 'piel', label: 'Piel Delicada', icon: '🌸' },
    { id: 'higiene', label: 'Higiene & Cuidados', icon: '🛁' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-container/40 via-white to-secondary-container/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-surface-container-high relative overflow-hidden">
        <span className="bg-secondary text-white font-headline font-bold text-xs px-4 py-1.5 rounded-full inline-block">
          GUÍAS Y CONSEJOS PEDIÁTRICOS
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface tracking-tight">
          Tips de Ensueño ☁️
        </h1>
        <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Consejos prácticos para guiar las rutinas de sueño, baño e hidratación de tu bebé, respaldados por dermatólogos y pediatras.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-2">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-outline absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por palabra clave (ej: masaje, llanto, baño)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-full text-xs sm:text-sm bg-white border border-surface-container-high shadow-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-headline font-semibold text-xs sm:text-sm transition-all squishy-button ${
              selectedCategory === cat.id
                ? 'bg-primary text-white shadow-soft-glow'
                : 'bg-white text-on-surface-variant hover:bg-surface-container border border-surface-container-high'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-12 text-on-surface-variant font-headline">
          Cargando tips de sueño... ☁️
        </div>
      ) : tips.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant space-y-2">
          <p className="font-headline font-bold">No se encontraron artículos</p>
          <p className="text-xs">Intenta con otra palabra clave o selecciona otra categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tips.map((tip) => (
            <div
              key={tip.id}
              onClick={() => setActiveTip(tip)}
              className="group bg-white rounded-3xl overflow-hidden soft-glow-card border border-surface-container-high flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="relative w-full h-48 bg-surface-container-low overflow-hidden">
                  <Image
                    src={tip.image}
                    alt={tip.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-secondary text-white font-headline font-bold text-[11px] px-3 py-1 rounded-full shadow-sm">
                    {tip.categoryLabel}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-3 text-[11px] text-outline font-medium">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{tip.readTime}</span>
                    </span>
                    <span>•</span>
                    <span>{tip.date}</span>
                  </div>

                  <h3 className="font-headline font-bold text-xl text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                    {tip.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                    {tip.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-surface-container-high/50 text-xs font-headline font-bold text-primary">
                <span>Leer Guía Completa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Reader Modal */}
      {activeTip && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 soft-glow-card relative space-y-6">
            <button
              onClick={() => setActiveTip(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <span className="bg-secondary-container text-secondary text-xs font-headline font-bold px-3 py-1 rounded-full">
                {activeTip.categoryLabel}
              </span>
              <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
                {activeTip.title}
              </h2>
              <div className="flex items-center space-x-3 text-xs text-on-surface-variant font-medium">
                <span className="flex items-center space-x-1 text-primary font-bold">
                  <User className="w-4 h-4" />
                  <span>{activeTip.author}</span>
                </span>
                <span>•</span>
                <span>{activeTip.authorRole}</span>
              </div>
            </div>

            <div className="relative w-full h-56 rounded-2xl overflow-hidden">
              <Image
                src={activeTip.image}
                alt={activeTip.title}
                fill
                sizes="(max-width: 640px) 100vw, 672px"
                className="object-cover"
              />
            </div>

            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              {activeTip.content.map((paragraph, index) => (
                <p key={index} className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={() => setActiveTip(null)}
                className="bg-primary text-white font-headline font-bold text-xs px-6 py-3 rounded-full squishy-button"
              >
                Cerrar Artículo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
