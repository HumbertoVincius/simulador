import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Simulador de Imóvel na Planta',
  description: 'Simule a compra de um imóvel na planta com financiamento e consórcio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased dark:bg-gray-900">{children}</body>
    </html>
  );
}

