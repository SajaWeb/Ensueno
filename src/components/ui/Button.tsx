import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'amber' | 'sky' | 'white' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Universal Ensueño Button Component
 * Symmetrical heights, soft pastel color palette (Pink, Blue, Yellow, White),
 * premium glassmorphism accents, and consistent typography across the application.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Symmetrical, rounded, smooth interaction base
    const baseStyles =
      'inline-flex items-center justify-center font-headline font-extrabold uppercase tracking-wider rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    // Strictly soft pastel colors - NO NEON
    const variants: Record<ButtonVariant, string> = {
      // Rosa Pastel Ensueño
      primary:
        'bg-gradient-to-r from-pink-300 via-pink-400 to-purple-300 hover:from-pink-400 hover:to-purple-400 text-white shadow-md shadow-pink-200/60 border border-white/40 focus:ring-pink-300',
      // Azul Pastel Ensueño
      secondary:
        'bg-gradient-to-r from-sky-200 via-sky-300 to-blue-300 hover:from-sky-300 hover:to-blue-400 text-slate-800 shadow-md shadow-sky-200/50 border border-white/50 focus:ring-sky-300',
      // Amarillo Pastel Ensueño
      amber:
        'bg-gradient-to-r from-yellow-200 via-amber-200 to-amber-300 hover:from-yellow-300 hover:to-amber-400 text-amber-950 shadow-md shadow-yellow-200/50 border border-white/50 focus:ring-amber-300',
      // Cielo Pastel Ensueño
      sky:
        'bg-gradient-to-r from-sky-100 via-sky-200 to-sky-300 hover:from-sky-200 hover:to-sky-400 text-sky-950 shadow-md shadow-sky-200/50 border border-white/60 focus:ring-sky-200',
      // Blanco Pastel / Cristal
      white:
        'bg-white/95 hover:bg-white text-slate-700 shadow-md shadow-slate-200/60 border border-slate-200/80 focus:ring-slate-300',
      // Delineado Pastel
      outline:
        'bg-transparent border-2 border-pink-300 text-pink-600 hover:bg-pink-50/80 focus:ring-pink-200',
      // Fantasma / Sutil
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-800 focus:ring-slate-200',
    };

    // Strict symmetrical heights for consistency across all screen elements
    const sizes: Record<ButtonSize, string> = {
      sm: 'h-9 px-4 text-[11px]',
      md: 'h-11 px-6 text-xs',
      lg: 'h-13 px-8 text-sm',
      icon: 'h-11 w-11 p-0 shrink-0',
    };

    const classes = [
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={isLoading || disabled}
        className={classes}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current opacity-80"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </span>
        ) : (
          <>
            {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
            <span className="truncate">{children}</span>
            {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
