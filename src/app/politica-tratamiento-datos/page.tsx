import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, ArrowLeft, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Política de Tratamiento de Datos Personales | Ensueño Baby',
  description: 'Política de protección y tratamiento de datos personales de Ensueño Baby conforme a la Ley 1581 de 2012 de Colombia (Habeas Data).',
};

export default function PoliticaTratamientoDatosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50/60 via-purple-50/40 to-sky-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation back link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-purple-700 hover:text-purple-900 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-purple-200/60 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 text-purple-800 text-xs font-bold uppercase tracking-wider border border-purple-200">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Habeas Data - Ley 1581 de 2012
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Política de Tratamiento de Datos Personales
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            En <strong>Ensueño Baby</strong> velamos por la seguridad, privacidad y confidencialidad de la información de nuestras mamás y sus familias. Cumplimos estrictamente con la legislación colombiana en materia de protección de datos personales.
          </p>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            Última actualización: <strong>Julio de 2026</strong> • Vigente para el territorio colombiano.
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-purple-800 font-extrabold text-base border-b border-purple-100 pb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>1. Identificación del Responsable del Tratamiento</span>
            </div>
            <p>
              El responsable del tratamiento de tus datos personales recopilados a través de la plataforma web <strong>ensueno.com.co</strong> es <strong>Ensueño Baby Colombia</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li><strong>Razón Social:</strong> Ensueño Baby Cuidado Infantil S.A.S.</li>
              <li><strong>Correo Electrónico de Contacto:</strong> privacidad@ensueno.com.co</li>
              <li><strong>Atención al Cliente:</strong> soporte@ensueno.com.co</li>
              <li><strong>Domicilio Principal:</strong> Medellín, Antioquia - Colombia.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-purple-800 font-extrabold text-base border-b border-purple-100 pb-2">
              <Lock className="w-5 h-5 text-purple-600" />
              <span>2. Finalidad del Tratamiento de Datos</span>
            </div>
            <p>
              Los datos personales recolectados (incluyendo nombres, correos electrónicos, teléfonos de contacto, direcciones de despacho en Colombia y datos del perfil del bebé como fecha de nacimiento y tipo de piel) serán utilizados exclusivamente para las siguientes finalidades:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-pink-50/60 rounded-2xl border border-pink-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                <span className="text-xs text-pink-950 font-medium">Procesamiento de compras, despacho y trazabilidad logística de pedidos.</span>
              </div>
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span className="text-xs text-purple-950 font-medium">Personalización de sugerencias de productos según la etapa de desarrollo del bebé.</span>
              </div>
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-xs text-amber-950 font-medium">Envío de recordatorios automáticos de recompra para mantener la rutina de sueño.</span>
              </div>
              <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="text-xs text-sky-950 font-medium">Notificación de cupones, promociones exclusivas y estado de pagos de MercadoPago.</span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-purple-800 font-extrabold text-base border-b border-purple-100 pb-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>3. Tratamiento de Datos Sensibles del Bebé</span>
            </div>
            <p>
              Garantizamos que la información referente a la salud de la piel del bebé (ej. piel sensible, atópica o con brotes) es tratada con máximo rigor de confidencialidad y únicamente con el fin de recomendar productos hipoalergénicos aprobados por dermatología y pediatría.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-purple-800 font-extrabold text-base border-b border-purple-100 pb-2">
              <Mail className="w-5 h-5 text-purple-600" />
              <span>4. Derechos de los Titulares (Habeas Data)</span>
            </div>
            <p>
              Como titular de los datos personales tienes derecho a:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Conocer, actualizar y rectificar tus datos personales en cualquier momento.</li>
              <li>Solicitar prueba de la autorización otorgada a Ensueño Baby.</li>
              <li>Ser informada sobre el uso dado a tus datos personales.</li>
              <li>Revocar la autorización o solicitar la supresión de tus datos cuando consideres que no se respeten los principios y garantías constitucionales.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-purple-800 font-extrabold text-base border-b border-purple-100 pb-2">
              <Phone className="w-5 h-5 text-purple-600" />
              <span>5. Canales para Ejercer tus Derechos</span>
            </div>
            <p>
              Puedes enviar una solicitud formal de actualización, rectificación o eliminación de tus datos personales escribiendo a nuestro correo oficial:
            </p>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-center font-bold text-xs text-purple-900">
              ✉️ Correo Oficial: <a href="mailto:privacidad@ensueno.com.co" className="text-purple-700 underline font-mono">privacidad@ensueno.com.co</a>
            </div>
          </section>

          {/* Contact & Footer Back Button */}
          <div className="pt-6 border-t border-slate-100 text-center space-y-4">
            <p className="text-xs text-slate-500">
              Al hacer clic en "Acepto la Política de Tratamiento de Datos" en nuestros formularios de registro y compra, autorizas de manera libre, previa, expresa e informada a Ensueño Baby para el uso responsable de tus datos.
            </p>
            <Link
              href="/"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all uppercase tracking-wider"
            >
              Entendido y Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
