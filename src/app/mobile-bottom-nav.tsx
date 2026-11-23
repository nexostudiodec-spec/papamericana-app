'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, History, ScanQrCode, UserRound } from 'lucide-react';

const items = [
  { href: '/', label: 'Inicio', icon: House },
  { href: '/mi-cuenta#pedidos', label: 'Historial', icon: History },
  { href: '/mi-cuenta?scan=1', label: 'Escanear', icon: ScanQrCode, primary: true },
  { href: '/mi-cuenta#perfil', label: 'Perfil', icon: UserRound },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 lg:hidden">
      <div className="relative mx-auto grid max-w-md grid-cols-4 items-end rounded-[25px] border border-black/[.06] bg-white/95 px-2 pb-2 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,.10)] backdrop-blur-xl">
        {items.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === '/' ? href === '/' : href.startsWith('/mi-cuenta') && pathname === '/mi-cuenta';
          return (
            <Link key={label} href={href} aria-label={label} className="relative flex min-h-[54px] flex-col items-center justify-end gap-1 text-[10px] font-bold transition-colors duration-200">
              {primary ? (
                <span className="-mt-9 grid h-[58px] w-[58px] place-items-center rounded-full border-[5px] border-[#fffdf8] bg-[#ffe600] text-black shadow-[0_5px_16px_rgba(0,0,0,.16)] transition-transform duration-200 active:scale-95">
                  <Icon size={25} strokeWidth={2.4}/>
                </span>
              ) : (
                <Icon size={21} strokeWidth={active ? 2.5 : 1.9} className={active ? 'text-black' : 'text-neutral-400'}/>
              )}
              <span className={primary ? 'mt-0 text-[10px] font-black text-black' : active ? 'text-black' : 'text-neutral-400'}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
