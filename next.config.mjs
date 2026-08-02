/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        // La "Crema Corporal" pasó a llamarse "Mantequilla Corporal". La
        // dirección vieja sigue circulando en enlaces compartidos y en Google:
        // el 301 la traspasa a la nueva en vez de dejarlas en un 404.
        source: '/productos/crema-corporal-ensueno',
        destination: '/productos/mantequilla-corporal-ensueno',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
