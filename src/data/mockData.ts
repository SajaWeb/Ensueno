import { Product, Tip, UserProfile } from '@/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'panitos-humedos',
    name: 'Pañitos Húmedos Ensueño',
    subtitle: 'Limpieza pura con extracto de algodón orgánico y manzanilla',
    category: 'higiene',
    price: 18900,
    originalPrice: 22000,
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://i.postimg.cc/dV03DDbN/Whats-App-Image-2026-07-24-at-10-08-29-AM-(3).jpg',
    badge: 'ESENCIAL DIARIO',
    fragrances: ['Manzanilla & Algodón', 'Sin Fragancia'],
    sizes: ['Paquete x80 telas', 'Pack x3 Paquetes'],
    description: 'Pañitos ultra-gruesos y resistentes elaborados con fibras de algodón 100% natural. Enriquecidos con agua pura desmineralizada y extracto de manzanilla para limpiar la piel delicada del bebé sin causar irritación ni enrojecimientos.',
    benefits: [
      'Tejido ultra-suave resistente de 3 capas',
      'Sin alcohol, parabenos ni perfume sintético',
      'Fórmula con 99% de agua purificada',
      'Cierre hermético tipo tapa rígida para conservar la humedad'
    ],
    ingredients: [
      'Agua Purificada (99%)',
      'Extracto de Flor de Manzanilla',
      'Glicerina Vegetal Humectante',
      'Extracto de Fibras de Algodón Orgánico'
    ],
    safetyInfo: 'Probados dermatológica y pediátricamente. Aptos para rostro, manos y zona del pañal desde el recién nacido.',
    inStock: true
  },
  {
    id: 'colonia-ensueno',
    name: 'Colonia Ensueño',
    subtitle: 'El aroma dulce que abraza sus días con caricias de flor de azahar',
    category: 'sueno',
    price: 28500,
    originalPrice: 32000,
    rating: 5.0,
    reviewsCount: 186,
    image: 'https://i.postimg.cc/wjBM33Ch/Whats-App-Image-2026-07-24-at-10-05-27-AM.jpg',
    badge: 'AROMA FAVORITO',
    fragrances: ['Flores Silvestres & Lavanda', 'Brisa de Nube'],
    sizes: ['150ml', '250ml'],
    description: 'Brisa fresca con notas de lavanda suave, flor de azahar y sutiles toques cítricos. Formulada sin alcohol para perfumar delicadamente la ropita, el peluche o la piel de tu bebé después del baño.',
    benefits: [
      'Fórmula 0% alcohol que respeta la barrera cutánea',
      'Aroma científicamente testeado para inducir calma',
      'No mancha la ropa ni genera alergias'
    ],
    ingredients: [
      'Agua Desionizada',
      'Esencia Natural de Lavanda de Provenza',
      'Extracto de Flor de Azahar',
      'Aceite de Ricino Hidrogenado'
    ],
    safetyInfo: 'Aprobado por la Asociación Colombiana de Dermatología Pediátrica.',
    inStock: true
  },
  {
    id: 'crema-corporal-ensueno',
    name: 'Cremas Corporales Ensueño',
    subtitle: 'Hidratación profunda 24h con Avena Coloidal & Manteca de Karité',
    category: 'piel',
    price: 32000,
    originalPrice: 38000,
    rating: 4.9,
    reviewsCount: 164,
    image: 'https://i.postimg.cc/QdMCVV2n/Whats-App-Image-2026-07-24-at-10-11-38-AM.jpg',
    badge: 'ULTRA HUMECTANTE',
    fragrances: ['Algodón & Karité', 'Sin Fragancia'],
    sizes: ['250ml', '500ml con dosificador'],
    description: 'Loción corporal de textura suave que se absorbe al instante sin dejar sensación grasosa. Nutre en profundidad la piel frágil del lactante, protegiéndola contra la resequedad del viento y cambios de temperatura.',
    benefits: [
      'Humectación continua clínicamente probada por 24 horas',
      'Restaura la capa lipídica natural de la piel',
      'Fórmula hipoalergénica probada en pieles sensibles y atópicas'
    ],
    ingredients: [
      'Avena Coloidal Orgánica',
      'Manteca de Karité Bio',
      'Aceite de Jojoba',
      'Vitamina E y Pantenol Pro-V5'
    ],
    safetyInfo: 'Libre de aceites minerales derivadas del petróleo, parabenos y siliconas.',
    inStock: true
  }
];

export const MOCK_TIPS: Tip[] = [
  {
    id: 'rutina-sueno-10-minutos',
    title: 'La rutina de 10 minutos para dormirse sin llanto',
    subtitle: 'Tres pasos sencillos para señalizar a tu bebé que la hora de descansar ha llegado.',
    category: 'sueno',
    categoryLabel: 'Sueño Infantil',
    readTime: '4 min lectura',
    date: '24 Jul 2026',
    author: 'Dra. Mariana Restrepo',
    authorRole: 'Pediatra y Especialista en Sueño Infantil',
    image: 'https://i.postimg.cc/rwpszzBj/Whats-App-Image-2026-07-24-at-10-08-29-AM.jpg',
    summary: 'Establecer una secuencia predecible todas las noches reduce el cortisol del bebé y fomenta un sueño continuo más profundo.',
    content: [
      'Paso 1: Limpieza suave con los Pañitos Húmedos Ensueño a luz tenue.',
      'Paso 2: Masaje amoroso con la Crema Corporal Ensueño en espaldita y piernas.',
      'Paso 3: Un toque de Colonia Ensueño en la manta para evocar aromas relajantes de lavanda.'
    ],
    tags: ['Sueño', 'Rutina Nocturna', 'Recién Nacidos']
  },
  {
    id: 'piel-sensible-invierno',
    title: 'Cómo cuidar la piel atópica durante el cambio de clima',
    subtitle: 'Evita brotes y sequedad excesiva en la piel de tu pequeño.',
    category: 'piel',
    categoryLabel: 'Piel Delicada',
    readTime: '3 min lectura',
    date: '18 Jul 2026',
    author: 'Dr. Alejandro Gomez',
    authorRole: 'Dermatólogo Pediátrico',
    image: 'https://i.postimg.cc/bwvrdd7T/Whats-App-Image-2026-07-24-at-10-06-48-AM-(1).jpg',
    summary: 'Los cambios de temperatura provocan deshidratación cutánea rápida. Te enseñamos a sellar la humedad natural.',
    content: [
      'Aplica la crema corporal dentro de los primeros 3 minutos posteriores a la limpieza.',
      'Evita ropa de lana o telas sintéticas directas en el cuerpo del bebé; prefiere siempre 100% algodón orgánico.',
      'Mantén la habitación a una temperatura templada constante (20°C - 22°C).'
    ],
    tags: ['Dermatología', 'Piel Sensible', 'Avena Coloidal']
  },
  {
    id: 'bano-relajante-temperatura',
    title: 'La temperatura ideal y duración perfecta del baño nocturno',
    subtitle: 'Consejos prácticos para transformar el baño en un oasis de relajación.',
    category: 'higiene',
    categoryLabel: 'Higiene & Cuidados',
    readTime: '5 min lectura',
    date: '10 Jul 2026',
    author: 'Enf. Camila Silva',
    authorRole: 'Especialista en Neonatología',
    image: 'https://i.postimg.cc/MpGHXXC0/Whats-App-Image-2026-07-24-at-10-06-48-AM.jpg',
    summary: 'Un baño demasiado caliente o prolongado puede resecar la epidermis del bebé. Descubre los parámetros óptimos.',
    content: [
      'El agua del baño debe estar entre 36.5°C y 37.5°C.',
      'La duración ideal para lactantes es de 5 a 10 minutos máximo.',
      'Usa pañitos y productos libres de sulfatos y jabón alcalino.'
    ],
    tags: ['Baño', 'Higiene', 'Sin Lágrimas']
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'María Alejandra Morales',
  email: 'maria.alejandra@example.com',
  phone: '+57 310 456 7890',
  babyName: 'Sofía',
  babyAgeMonths: 6,
  skinType: 'Sensible',
  address: 'Calle 127 # 14-45, Apto 502, Bogotá',
  savedItemIds: ['panitos-humedos', 'colonia-ensueno'],
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    nightRoutineReminder: true
  }
};
