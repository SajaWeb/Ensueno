import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, ArrowLeft, Mail, Phone, Check } from 'lucide-react';
import NubeDivider from '@/components/ui/NubeDivider';

export const metadata = {
  title: 'Política de Tratamiento de Datos Personales | Ensueño Baby',
  description: 'Política de protección y tratamiento de datos personales de Ensueño Baby conforme a la Ley 1581 de 2012 de Colombia (Habeas Data).',
};

/** Para qué se usan los datos. Cada tarjeta de la rejilla sale de aquí. */
const FINALIDADES = [
  'Procesamiento de compras, despacho y trazabilidad logística de pedidos.',
  'Personalización de sugerencias de productos según la etapa de desarrollo del bebé.',
  'Envío de recordatorios automáticos de recompra para mantener la rutina de sueño.',
  'Notificación de cupones, promociones exclusivas y estado de pagos de MercadoPago.',
];

const DERECHOS = [
  'Conocer, actualizar y rectificar tus datos personales en cualquier momento.',
  'Solicitar prueba de la autorización otorgada a Ensueño Baby.',
  'Ser informada sobre el uso dado a tus datos personales.',
  'Revocar la autorización o solicitar la supresión de tus datos cuando consideres que no se respeten los principios y garantías constitucionales.',
];

/** Encabezado de sección: mismo tratamiento en las cinco. */
function SeccionTitulo({ Icon, children }: { Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 font-display text-xl text-tinta border-b border-borde pb-3">
      <Icon className="w-5 h-5 text-azul shrink-0" aria-hidden="true" />
      {children}
    </h2>
  );
}

export default function PoliticaTratamientoDatosPage() {
  return (
    <div className="page-entry-anim">
      {/* ================= Encabezado ================= */}
      <section className="ens-band ens-band--celeste">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <p className="ens-eyebrow text-azul">Habeas Data · Ley 1581 de 2012</p>

          <h1 className="mt-3 font-display text-tinta leading-tight text-[clamp(2rem,5vw,3.5rem)]">
            Política de tratamiento de datos
          </h1>

          <p className="mt-5 text-lg text-tinta-suave leading-relaxed">
            En Ensueño cuidamos la información de las mamás y sus familias con el mismo rigor con el
            que formulamos los productos.
          </p>

          <p className="mt-6 text-xs text-tinta-suave">
            Última actualización: <strong className="text-tinta">julio de 2026</strong> · Vigente para
            el territorio colombiano.
          </p>
        </div>

        <NubeDivider className="text-white -mb-px" />
      </section>

      {/* ================= Contenido ================= */}
      <section className="ens-band ens-band--blanco">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-tinta-suave hover:text-azul transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver al inicio
          </Link>

          <div className="space-y-12 text-tinta-suave leading-relaxed">
            {/* 1 */}
            <section className="space-y-4">
              <SeccionTitulo Icon={FileText}>1. Quién responde por tus datos</SeccionTitulo>
              <p>
                El responsable del tratamiento de los datos personales recopilados a través de{' '}
                <strong className="text-tinta">ensueno.com.co</strong> es Ensueño Baby Colombia.
              </p>
              <dl className="bg-cian border border-borde rounded-2xl p-5 grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  ['Razón social', 'Ensueño Baby Cuidado Infantil S.A.S.'],
                  ['Domicilio principal', 'Medellín, Antioquia — Colombia'],
                  ['Correo de privacidad', 'privacidad@ensueno.com.co'],
                  ['Atención al cliente', 'soporte@ensueno.com.co'],
                ].map(([etiqueta, valor]) => (
                  <div key={etiqueta}>
                    <dt className="ens-eyebrow text-tinta-suave">{etiqueta}</dt>
                    <dd className="mt-1 font-bold text-tinta break-words">{valor}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* 2 */}
            <section className="space-y-4">
              <SeccionTitulo Icon={Lock}>2. Para qué usamos tus datos</SeccionTitulo>
              <p>
                Los datos recolectados —nombre, correo, teléfono, dirección de despacho en Colombia y
                datos del perfil del bebé como la fecha de nacimiento y el tipo de piel— se usan
                exclusivamente para:
              </p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {FINALIDADES.map((finalidad) => (
                  <li
                    key={finalidad}
                    className="bg-white border border-borde rounded-2xl p-4 flex items-start gap-2.5 text-sm"
                  >
                    <Check className="w-4 h-4 text-azul shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{finalidad}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 3 */}
            <section className="space-y-4">
              <SeccionTitulo Icon={ShieldCheck}>3. Datos sensibles del bebé</SeccionTitulo>
              <p>
                La información sobre la piel del bebé —sensible, atópica o con brotes— se trata con el
                máximo rigor de confidencialidad y únicamente para recomendar productos hipoalergénicos
                y probados en pieles sensibles.
              </p>
            </section>

            {/* 4 */}
            <section className="space-y-4">
              <SeccionTitulo Icon={Mail}>4. Tus derechos como titular</SeccionTitulo>
              <ul className="space-y-2.5">
                {DERECHOS.map((derecho) => (
                  <li key={derecho} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-azul shrink-0 mt-1" aria-hidden="true" />
                    <span>{derecho}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 5 */}
            <section className="space-y-4">
              <SeccionTitulo Icon={Phone}>5. Cómo ejercerlos</SeccionTitulo>
              <p>
                Escríbenos para actualizar, rectificar o eliminar tus datos personales. Respondemos a
                toda solicitud formal recibida en:
              </p>
              <div className="bg-celeste border border-borde rounded-2xl p-6 text-center">
                <p className="ens-eyebrow text-azul">Correo oficial</p>
                <a
                  href="mailto:privacidad@ensueno.com.co"
                  className="mt-2 inline-block font-display text-xl sm:text-2xl text-azul hover:text-azul-hondo transition-colors break-all"
                >
                  privacidad@ensueno.com.co
                </a>
              </div>
            </section>

            {/* Cierre */}
            <div className="border-t border-borde pt-8 text-center space-y-6">
              <p className="text-sm">
                Al marcar «Acepto la Política de Tratamiento de Datos» en los formularios de registro y
                compra, autorizas de manera libre, previa, expresa e informada a Ensueño Baby para el
                uso responsable de tus datos.
              </p>
              <Link href="/" className="ens-btn ens-btn--azul">
                Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
