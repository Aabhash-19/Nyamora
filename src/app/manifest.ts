import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nyamora (ニャモラ) — Doujinshi Discovery & Reader',
    short_name: 'Nyamora',
    description: 'AI-Powered Doujinshi Discovery Platform with Nyan-chan concierge and authentic reader.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0b10',
    theme_color: '#a855f7',
    icons: [
      {
        src: '/avatars/nyan-chan-host.jpg',
        sizes: '192x192 512x512',
        type: 'image/jpeg',
        purpose: 'any'
      },
      {
        src: '/avatars/nyan-chan-host.jpg',
        sizes: '192x192 512x512',
        type: 'image/jpeg',
        purpose: 'maskable'
      }
    ]
  };
}
