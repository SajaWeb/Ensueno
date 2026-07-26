import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#30628a',
          foreground: '#ffffff',
          container: '#a2d2ff',
          'on-container': '#275b82',
          fixed: '#cde5ff',
          'fixed-dim': '#9bcbf8',
        },
        secondary: {
          DEFAULT: '#80515e',
          foreground: '#ffffff',
          container: '#fec1d0',
          'on-container': '#7b4c59',
          fixed: '#ffd9e1',
          'fixed-dim': '#f2b7c5',
        },
        tertiary: {
          DEFAULT: '#6e5d24',
          foreground: '#ffffff',
          container: '#e3cb87',
          'on-container': '#66551d',
          fixed: '#fae19b',
          'fixed-dim': '#dcc582',
        },
        surface: {
          DEFAULT: '#f7fafe',
          dim: '#d7dade',
          bright: '#f7fafe',
          lowest: '#ffffff',
          low: '#f1f4f8',
          container: '#ebeef2',
          high: '#e5e8ec',
          highest: '#e0e3e7',
          variant: '#e0e3e7',
        },
        'on-surface': {
          DEFAULT: '#181c1f',
          variant: '#41474e',
        },
        outline: {
          DEFAULT: '#72787f',
          variant: '#c1c7cf',
        },
        error: {
          DEFAULT: '#ba1a1a',
          foreground: '#ffffff',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
      },
      fontFamily: {
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft-glow': '0 10px 30px -5px rgba(48, 98, 138, 0.12)',
        'soft-pink-glow': '0 10px 30px -5px rgba(128, 81, 94, 0.15)',
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
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'gentle-pulse': 'gentle-pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 2s infinite',
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
      },
    },
  },
  plugins: [],
};

export default config;
