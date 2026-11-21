import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PAPAMERICANA | Compra fácil, recibe en casa',
  description: 'Explora el catálogo de PAPAMERICANA y realiza tus pedidos en línea.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
