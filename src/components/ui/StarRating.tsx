import React from 'react';

/**
 * La estrella de la marca — la misma silueta redondeada de la mascota — en vez
 * del ícono genérico. Aparece en cada tarjeta y en la ficha de producto.
 */
function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path
        d="M12 2.6c.5 0 .9.3 1.1.7l2.3 4.9 5.2.7c.5.1.9.4 1 .9.2.5 0 1-.3 1.3l-3.8 3.6.9 5.2c.1.5-.1 1-.5 1.3-.4.3-.9.3-1.4.1L12 19l-4.6 2.4c-.4.2-1 .2-1.4-.1-.4-.3-.6-.8-.5-1.3l.9-5.2-3.8-3.6c-.4-.3-.5-.8-.3-1.3.1-.5.5-.8 1-.9l5.2-.7 2.3-4.9c.2-.4.7-.7 1.2-.7Z"
        fill={filled ? '#f8e898' : '#eff5fa'}
        stroke={filled ? '#8a6b00' : '#d0dce7'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StarRating({
  rating,
  count,
  className = '',
}: {
  rating: number;
  count: number;
  className?: string;
}) {
  const hasReviews = count > 0;
  const rounded = hasReviews ? Math.round(rating) : 0;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className="flex gap-0.5"
        role="img"
        aria-label={
          hasReviews
            ? `${rating.toFixed(1)} de 5 estrellas, ${count} reseñas`
            : 'Sin reseñas todavía'
        }
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < rounded} />
        ))}
      </div>
      {hasReviews ? (
        <span className="text-xs text-tinta-suave" aria-hidden="true">
          <span className="font-bold text-tinta">{rating.toFixed(1)}</span> ({count})
        </span>
      ) : (
        <span className="text-xs text-tinta-suave" aria-hidden="true">
          Sin reseñas
        </span>
      )}
    </div>
  );
}
