import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata = {
  title: 'Haie Lite — Taille de haies au Québec',
  description: 'Service professionnel de taille de haies au Grand Montréal. Soumission gratuite en 30 secondes.',
  keywords: 'taille de haies, élagage, cèdre, Montréal, Rive-Sud, Vaudreuil',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#1a4d2e',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Haie Lite',
  },
  openGraph: {
    title: 'Haie Lite — Taille de haies au Québec',
    description: 'Service professionnel de taille de haies au Grand Montréal. Soumission gratuite en 30 secondes.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
