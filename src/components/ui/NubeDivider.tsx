import React from 'react';

/**
 * Firma de la marca: el borde de nubes que separa dos bandas sólidas.
 * Codifica el nombre — Ensueño — y retoma el arco de nube del logo.
 *
 * El relleno es `currentColor`, así que se le pasa el color de la banda que
 * viene DEBAJO: la nube se recorta contra la banda de arriba.
 * Se usa dos o tres veces por página como máximo; es el único adorno.
 */
export default function NubeDivider({
  className = '',
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <div className={`ens-nubes ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        focusable="false"
        style={flip ? { transform: 'rotate(180deg)' } : undefined}
      >
        <path
          fill="currentColor"
          // 15 tramos de 80px = 1200, el ancho completo del viewBox. Si el
          // trazo termina antes, el resto de la banda queda con borde recto.
          d="M0 60V38c40 0 40-24 80-24s40 24 80 24 40-28 80-28 40 28 80 28 40-22 80-22 40 22 80 22 40-26 80-26 40 26 80 26 40-24 80-24 40 24 80 24 40-28 80-28 40 28 80 28 40-20 80-20 40 20 80 20 40-26 80-26v48Z"
        />
      </svg>
    </div>
  );
}
