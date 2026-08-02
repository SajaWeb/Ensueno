/**
 * Proclamas de la marca, en un solo sitio.
 *
 * Antes cada página escribía la suya y aparecieron afirmaciones que no están
 * aprobadas ("Avalado por la Asociación Colombiana de Pediatría"). Todo lo que
 * el sitio afirme sobre los productos debe salir de aquí: si cambia lo que la
 * marca puede decir, se cambia en este archivo y no hay que ir a buscarlo.
 */

/** Las tres únicas proclamas aprobadas para Ensueño. */
export const PROCLAMAS_APROBADAS = [
  'Dermatológicamente comprobados',
  'Hipoalergénicos',
  'Probados en pieles sensibles',
] as const;

/** Composición: lo que las fórmulas son y lo que no llevan. */
export const ATRIBUTOS_FORMULA = [
  'Vegano',
  'Libre de crueldad animal',
  'Sin parabenos',
  'Sin colorantes',
  'Sin sulfatos',
] as const;

/** Cadena lista para el campo "Sellos de Seguridad" del panel. */
export const PROCLAMAS_TEXTO = PROCLAMAS_APROBADAS.join(' • ');

/** Cadena lista para el campo de composición del panel. */
export const ATRIBUTOS_TEXTO = 'Vegano, libre de crueldad animal, sin parabenos, sin colorantes, sin sulfatos';
