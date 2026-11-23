'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { LayoutDashboard, Package, Tags, ClipboardList, Truck, Users, Settings, Gift, X, Menu, ArrowLeft, LogOut } from 'lucide-react';
import { signOut } from '@/app/login/actions';

const items=[
 {href:'/admin',label:'Resumen',icon:LayoutDashboard},
 {href:'/admin/products',label:'Productos y menú',icon:Package},
 {href:'/admin/categories',label:'Categorías',icon:Tags},
 {href:'/admin/orders',label:'Pedidos',icon:ClipboardList},
 {href:'/admin/delivery',label:'Entregas',icon:Truck},
 {href:'/admin/customers',label:'Clientes',icon:Users},
 {href:'/admin/loyalty/scan',label:'Fidelización',icon:Gift},
 {href:'/admin/settings',label:'Configuración',icon:Settings},
];
export default function AdminShell({children,logoUrl,storeName}:{children:ReactNode;logoUrl:string|null;storeName:string}){
 const pathname=usePathname(); const [open,setOpen]=useState(false);
 const nav=<><Link href="/" className="flex min-h-[76px] w-full items-center px-1 py-1" onClick={()=>setOpen(false)}>{logoUrl?<img src={logoUrl} alt={storeName} className="block h-auto max-h-[82px] w-full object-contain object-left"/>:<span className="text-[19px] font-black tracking-tight text-white">{storeName.toUpperCase()}</span>}</Link>
 <p className="mb-3 mt-12 px-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-slate-400">Administración</p>
 <nav className="space-y-2">{items.map(item=>{const active=pathname===item.href || (item.href!=='/admin'&&pathname.startsWith(item.href));return <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-colors duration-150 '+(active?'bg-white/15 text-white':'text-slate-400 hover:bg-white/[.07] hover:text-white')}><item.icon size={19}/>{item.label}</Link>})}</nav>
 <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.05] p-4"><p className="text-xs font-black text-[#ffd21c]">PANEL DEL RESTAURANTE</p><p className="mt-2 text-xs leading-5 text-slate-400">Gestiona el menú y la operación de {storeName}.</p></div></>;
 return <div className="min-h-screen bg-[#f5f5f3] text-[#171717]">
  <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-[#17233a] p-5 text-white lg:flex">{nav}</aside>
  {open&&<div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Cerrar menú" onClick={()=>setOpen(false)} className="absolute inset-0 bg-black/40"/><aside className="relative flex h-full w-[min(86vw,320px)] flex-col bg-[#17233a] p-5 text-white shadow-2xl"><button onClick={()=>setOpen(false)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-300"><X size={18}/></button>{nav}</aside></div>}
  <div className="min-h-screen lg:pl-[248px]"><header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7"><div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} className="rounded-xl border border-slate-200 p-2 lg:hidden" aria-label="Abrir menú"><Menu size={18}/></button><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{storeName} / ADMIN</p><p className="text-sm font-black text-[#17233a]">Panel de administración</p></div></div><div className="flex items-center gap-2"><Link href="/" className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold sm:flex"><ArrowLeft size={14}/> Ver tienda</Link><form action={signOut}><button className="flex items-center gap-2 rounded-full bg-[#17233a] px-4 py-2.5 text-xs font-bold text-white"><LogOut size={14}/><span className="hidden sm:inline">Salir</span></button></form></div></header><main className="p-4 sm:p-6 lg:p-8">{children}</main></div>
 </div>;
}
