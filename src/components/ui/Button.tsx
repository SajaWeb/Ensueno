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

    // Colores sólidos de marca. Los nombres del union se conservan tal cual:
    // confirmacion/[id] es el único consumidor y pasa `white`/`secondary`/`lg`
    // en 5 sitios — renombrar variantes rompería TypeScript ahí.
    const variants: Record<ButtonVariant, string> = {
      // Ancla oscura + blanco → 7.31:1
      primary:
        'bg-azul hover:bg-azul-hondo text-white border border-azul hover:border-azul-hondo focus:ring-azul',
      // Celeste de marca con tinta oscura → 11.60:1
      secondary:
        'bg-celeste hover:bg-cian text-tinta border border-celeste focus:ring-azul',
      // Amarillo de marca con tinta oscura → 12.33:1
      amber: 'bg-amarillo hover:bg-cian text-tinta border border-amarillo focus:ring-azul',
      // Cian de marca con tinta oscura → 13.71:1
      sky: 'bg-cian hover:bg-celeste text-tinta border border-cian focus:ring-azul',
      white: 'bg-white hover:bg-cian text-tinta border border-borde focus:ring-azul',
      outline:
        'bg-transparent border-2 border-azul text-azul hover:bg-celeste hover:text-tinta focus:ring-azul',
      ghost: 'bg-transparent text-tinta-suave hover:bg-cian hover:text-tinta focus:ring-azul',
    };

    // `lg` lleva padding vertical propio: `h-13` no existía en la escala por
    // defecto de Tailwind v3 y el botón colapsaba a la altura del texto.
    const sizes: Record<ButtonSize, string> = {
      sm: 'h-9 px-4 text-[11px]',
      md: 'h-11 px-6 text-xs',
      lg: 'h-13 py-3.5 px-8 text-sm',
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
