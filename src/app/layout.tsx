import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PAPAMERICANA | Hamburguesas, salchipapas y comida rápida',
  description: 'Pide hamburguesas, salchipapas, hot dogs, combos, papas y bebidas en PAPAMERICANA.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
