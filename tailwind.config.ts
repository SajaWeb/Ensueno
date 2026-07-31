import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* ---------------------------------------------------------------
         * Paleta oficial Ensueño. Los seis colores de marca son TINTES: el
         * más oscuro (#f6bac7) da 1.64:1 contra blanco, así que ninguno puede
         * cargar texto blanco. Por eso las bandas van en color claro con
         * tinta oscura encima, y el blanco se reserva para los botones.
         *
         * `tinta` y `azul` son las dos únicas anclas oscuras. No se inventan:
         * son la lavanda (H=233) y el celeste (H=200) de la marca, bajados de
         * luminosidad. Todo verificado AA/AAA sobre las seis bandas.
         * ------------------------------------------------------------- */
        // --- Primarios de marca ---
        rosa: '#f6bac7',
        amarillo: '#f4e5a6',
        lavanda: '#d3d5e5',
        // --- Secundarios de marca ---
        cian: '#e4f3f7',
        celeste: '#bde4f8',

        // --- Anclas oscuras (derivadas, para que el texto se lea) ---
        tinta: {
          DEFAULT: '#1f2333', // 9.48–15.60:1 sobre las seis bandas (AAA)
          suave: '#4f5469', // 4.55–7.49:1 sobre las seis bandas (AA)
        },
        azul: {
          DEFAULT: '#1d5c7c', // relleno de botón + texto blanco → 7.31:1 (AAA)
          hondo: '#153d51', // hover y titulares → 11.55:1 (AAA)
        },
        borde: '#d3d5e5', // la lavanda de marca. SOLO borde, nunca texto.

        /* ---------------------------------------------------------------
         * Claves heredadas (Material 3). Se repuntan, no se renombran: hay
         * 123 usos fuera de alcance (85 solo en productos/[id]) y una clave
         * renombrada no degrada — la clase deja de generarse y el elemento
         * pierde el color entero. Se borrarán al migrar esas páginas.
         * ------------------------------------------------------------- */
        primary: {
          // Debe seguir oscuro: hay 4 sitios con `bg-primary text-white`.
          DEFAULT: '#1d5c7c',
          foreground: '#ffffff',
          container: '#bde4f8',
          'on-container': '#153d51',
          fixed: '#e4f3f7',
          'fixed-dim': '#bde4f8',
        },
        secondary: {
          // Ancla oscura en el tono rosa de marca (H=347), para que
          // `bg-secondary text-white` de la ficha de producto se lea.
          DEFAULT: '#8c3049',
          foreground: '#ffffff',
          container: '#f6bac7',
          'on-container': '#6b2137',
          fixed: '#fbdde4',
          'fixed-dim': '#f6bac7',
        },
        tertiary: {
          // Ámbar oscuro, NO el amarillo de marca: `text-tertiary` y
          // `fill-tertiary` son las estrellas del rating, y #f4e5a6 sobre
          // blanco da 1.26:1 — desaparecerían.
          DEFAULT: '#7d6410',
          foreground: '#ffffff',
          container: '#f4e5a6',
          'on-container': '#54430a',
          fixed: '#faf1cf',
          'fixed-dim': '#f4e5a6',
        },
        surface: {
          DEFAULT: '#e4f3f7',
          dim: '#d3d5e5',
          bright: '#ffffff',
          lowest: '#ffffff',
          low: '#ffffff',
          container: '#e4f3f7',
          // Claves entrecomilladas: `surface-container-low` y
          // `surface-container-high` tienen 57 usos que antes no emitían nada.
          'container-low': '#ffffff',
          'container-high': '#d3d5e5',
          high: '#d3d5e5',
          highest: '#d3d5e5',
          variant: '#d3d5e5',
        },
        'on-surface': {
          DEFAULT: '#1f2333',
          variant: '#4f5469',
        },
        outline: {
          // Oscuro, NO la lavanda. `text-outline` son conteos de reseñas y
          // precios tachados: #d3d5e5 sobre blanco da 1.46:1.
          DEFAULT: '#4f5469',
          variant: '#d3d5e5',
        },
        error: {
          DEFAULT: '#ba1a1a',
          foreground: '#ffffff',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
      },
      fontFamily: {
        // DynaPuff. Opt-in explícito: solo titulares, títulos de tarjeta y
        // precios grandes. Nunca en micro-copy.
        display: ['var(--font-display)', 'ui-rounded', 'sans-serif'],
        sans: ['var(--font-body)', 'Segoe UI', 'sans-serif'],
        body: ['var(--font-body)', 'Segoe UI', 'sans-serif'],
        // Alias deliberado. `font-headline` tiene 71 usos en 8 archivos, entre
        // ellos Button.tsx sobre text-[11px] en mayúsculas: DynaPuff a ese
        // tamaño es ilegible. Se apunta a Nunito hasta migrar cada sitio.
        headline: ['var(--font-body)', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft-glow': '0 10px 30px -5px rgba(20, 52, 82, 0.16)',
        'soft-pink-glow': '0 10px 30px -5px rgba(158, 46, 74, 0.18)',
        'squishy-inset': 'inset 0 2px 4px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },
      spacing: {
        // `h-13` is referenced by Button size="lg"; not part of Tailwind's default scale.
        13: '3.25rem',
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'gentle-pulse': 'gentle-pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 2s infinite',
        'fade-in': 'fade-in 0.3s ease-out both',
        'scale-in': 'scale-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) both',
        'spin-slow': 'spin 3s linear infinite',
        shake: 'shake 0.4s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        'gentle-pulse': {
          '0%': { transform: 'scale(1)', boxShadow: '0 10px 30px -5px rgba(48, 98, 138, 0.1)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 15px 35px -5px rgba(48, 98, 138, 0.2)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 10px 30px -5px rgba(48, 98, 138, 0.1)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(-4px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
