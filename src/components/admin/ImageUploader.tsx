'use client';

import { useId, useRef, useState } from 'react';
import { UploadCloud, Loader2, X, ImageIcon, Link2 } from 'lucide-react';

/** Tope de Cloudinary para imágenes en el plan gratuito. */
const MAX_BYTES = 10 * 1024 * 1024;

export type UploadSection = 'productos' | 'promociones' | 'tips' | 'hero';

/**
 * Sube una imagen a Cloudinary y devuelve su URL.
 *
 * La firma la da `/api/v1/admin/uploads` (con sesión de administrador) y el
 * archivo va del navegador directo a Cloudinary: no pasa por el servidor, así
 * que no choca con el tope de tamaño de cuerpo de las funciones.
 */
async function subirACloudinary(file: File, section: UploadSection, onProgress: (pct: number) => void) {
  const firmaRes = await fetch('/api/v1/admin/uploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section }),
  });
  const firma = await firmaRes.json();
  if (!firma.success) throw new Error(firma.error || 'No pudimos preparar la carga');

  const { signature, timestamp, folder, apiKey, uploadUrl } = firma.data;

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  // XHR y no fetch: es la única forma de tener porcentaje de subida.
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve(res.secure_url as string);
        } else {
          reject(new Error(res?.error?.message || 'Cloudinary rechazó la imagen'));
        }
      } catch {
        reject(new Error('Respuesta inesperada de Cloudinary'));
      }
    };

    xhr.onerror = () => reject(new Error('No pudimos conectar con Cloudinary'));
    xhr.send(form);
  });
}

interface Props {
  /** URL actual. Cadena vacía = sin imagen. */
  value: string;
  onChange: (url: string) => void;
  section: UploadSection;
  label?: string;
  hint?: string;
  /** Alto de la miniatura. Las fichas cuadradas y el hero apaisado difieren. */
  aspect?: 'square' | 'wide';
  required?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  section,
  label = 'Imagen',
  hint,
  aspect = 'square',
  required = false,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [modoUrl, setModoUrl] = useState(false);

  const manejarArchivo = async (file?: File | null) => {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Ese archivo no es una imagen.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el tope son 10 MB.`);
      return;
    }

    setSubiendo(true);
    setProgreso(0);
    try {
      const url = await subirACloudinary(file, section, setProgreso);
      onChange(url);
    } catch (err: any) {
      setError(err?.message || 'No pudimos subir la imagen');
    } finally {
      setSubiendo(false);
      setProgreso(0);
      // Permite volver a elegir el mismo archivo si algo falló.
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const alturaPreview = aspect === 'wide' ? 'h-28' : 'h-32';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={inputId} className="block text-[11px] font-black uppercase tracking-wider text-tinta-suave">
          {label} {required && '*'}
        </label>
        <button
          type="button"
          onClick={() => setModoUrl((v) => !v)}
          className="text-[10px] font-bold text-azul hover:text-azul-hondo transition-colors inline-flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          {modoUrl ? 'Subir un archivo' : 'Pegar una URL'}
        </button>
      </div>

      {modoUrl ? (
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/…"
          className="w-full px-4 py-2.5 rounded-xl border border-borde text-sm bg-white focus:outline-none focus:ring-2 focus:ring-celeste"
        />
      ) : (
        <div className="flex items-start gap-3">
          {/* Zona de carga */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              manejarArchivo(e.dataTransfer.files?.[0]);
            }}
            className={`flex-1 rounded-xl border-2 border-dashed transition-colors ${
              arrastrando ? 'border-azul bg-celeste' : 'border-borde bg-white hover:border-azul hover:bg-cian'
            }`}
          >
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => manejarArchivo(e.target.files?.[0])}
            />

            <label
              htmlFor={inputId}
              className={`flex flex-col items-center justify-center gap-1.5 ${alturaPreview} px-4 text-center cursor-pointer ${
                subiendo ? 'pointer-events-none' : ''
              }`}
            >
              {subiendo ? (
                <>
                  <Loader2 className="w-5 h-5 text-azul animate-spin" />
                  <span className="text-xs font-bold text-azul">Subiendo… {progreso}%</span>
                  <span className="block w-32 h-1.5 rounded-full bg-borde overflow-hidden">
                    <span
                      className="block h-full bg-azul transition-all duration-200"
                      style={{ width: `${progreso}%` }}
                    />
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-azul" />
                  <span className="text-xs font-bold text-tinta">
                    Arrastra la imagen o <span className="text-azul underline">búscala</span>
                  </span>
                  <span className="text-[10px] text-tinta-suave">JPG, PNG o WebP · hasta 10 MB</span>
                </>
              )}
            </label>
          </div>

          {/* Miniatura */}
          <div
            className={`w-28 ${alturaPreview} shrink-0 rounded-xl bg-celeste border border-borde overflow-hidden grid place-items-center relative`}
          >
            {value ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => onChange('')}
                  title="Quitar la imagen"
                  className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-white/90 border border-borde text-tinta-suave hover:text-secondary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <ImageIcon className="w-6 h-6 text-borde" />
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] font-bold text-secondary mt-1.5">{error}</p>}
      {hint && !error && <p className="text-[10px] text-tinta-suave mt-1.5">{hint}</p>}
    </div>
  );
}
