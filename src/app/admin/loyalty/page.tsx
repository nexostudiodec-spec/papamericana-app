import Link from 'next/link';
import { ArrowLeft, Gift, Users, Stamp, QrCode, Printer, ExternalLink } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic='force-dynamic';

export default async function LoyaltyPage(){
 const s=await createSupabaseServerClient(); if(!s)return null;
 const [{data:settings},{data:customers,error},{data:events}]=await Promise.all([
  s.from('loyalty_settings').select('stamps_required,reward_description,is_active').eq('id',true).maybeSingle(),
  s.from('customers').select('id,full_name,phone,email,loyalty_stamps,loyalty_enrolled_at,loyalty_qr_token').not('loyalty_enrolled_at','is',null).order('loyalty_stamps',{ascending:false}).limit(300),
  s.from('loyalty_stamp_events').select('customer_id,stamps,source,created_at').order('created_at',{ascending:false}).limit(500)
 ]);
 const required=settings?.stamps_required??6;
 const enrolled=customers??[];
 const eventMap=new Map<string,number>();
 for(const e of events??[])eventMap.set(e.customer_id,(eventMap.get(e.customer_id)??0)+e.stamps);
 const totalStamps=enrolled.reduce((n,c)=>n+c.loyalty_stamps,0);
 const origin='https://papamericana-app.vercel.app/mi-cuenta?accion=sellar';
 const qr='https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=18&data='+encodeURIComponent(origin);
 return <div className="mx-auto max-w-[1400px]">
  <div className="mb-7"><Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500"><ArrowLeft size={15}/> Panel</Link><p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-neutral-400">PAPAMERICANA / CLIENTES FRECUENTES</p><h1 className="mt-1 text-3xl font-black text-black">Fidelización</h1><p className="mt-1 text-sm text-neutral-500">Controla las tarjetas de sellos y las compras que generan recompensas.</p></div>
  <div className="grid gap-4 sm:grid-cols-3"><article className="rounded-2xl border bg-white p-5"><p className="text-sm font-semibold text-neutral-500">Clientes fidelizados</p><p className="mt-3 text-3xl font-black">{enrolled.length}</p></article><article className="rounded-2xl border bg-white p-5"><p className="text-sm font-semibold text-neutral-500">Sellos acumulados</p><p className="mt-3 text-3xl font-black">{totalStamps}</p></article><article className="rounded-2xl border bg-white p-5"><p className="text-sm font-semibold text-neutral-500">Sellos para recompensa</p><p className="mt-3 text-3xl font-black">{required}</p><p className="mt-1 text-xs text-neutral-400">{settings?.reward_description??'Premio por completar tu tarjeta'}</p></article></div>
  <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
   <div className="overflow-hidden rounded-2xl border bg-white"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-black">Clientes fidelizados</h2><p className="mt-1 text-xs text-neutral-500">Sellos actuales y progreso hacia el premio.</p></div><span className="rounded-full bg-[#fff2b5] px-3 py-1 text-xs font-black">{enrolled.length} clientes</span></div>
    {error?<p className="p-6 text-sm text-red-600">No se pudo cargar la lista de clientes.</p>:enrolled.length===0?<div className="p-12 text-center"><Users className="mx-auto text-neutral-300"/><p className="mt-3 font-bold">Todavía no hay clientes fidelizados</p><p className="mt-1 text-xs text-neutral-500">Los clientes aparecerán aquí cuando se inscriban y acumulen sellos.</p></div>:<div className="divide-y">{enrolled.map(c=>{const stamps=c.loyalty_stamps??0;const remaining=Math.max(0,required-(stamps%required));const progress=(stamps%required)/required*100;return <div key={c.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{c.full_name}</p><p className="mt-1 text-xs text-neutral-500">{c.phone}{c.email?' · '+c.email:''}</p></div><div className="text-right"><p className="text-lg font-black">{stamps} <span className="text-xs font-medium text-neutral-400">sellos</span></p><p className="text-[11px] text-neutral-500">{remaining===0?'Premio disponible': 'Faltan '+remaining+' para el premio'}</p></div></div><div className="mt-4 flex gap-1.5">{Array.from({length:required}).map((_,i)=><div key={i} className={'h-2 flex-1 rounded-full '+(i<stamps%required?'bg-[#ffd21c]':'bg-neutral-100')}/>)}</div><div className="mt-2 flex justify-between text-[10px] text-neutral-400"><span>{eventMap.get(c.id)??0} sellos registrados en historial</span><span>{Math.round(progress)}%</span></div></div>})}</div>}
   </div>
   <aside className="h-fit rounded-2xl border bg-white p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff2b5]"><QrCode size={21}/></div><h2 className="mt-4 text-lg font-black">QR fijo del restaurante</h2><p className="mt-1 text-xs leading-5 text-neutral-500">Este será el código que el cliente escanea desde Mi cuenta para registrar su sello al visitar el local.</p><div className="mt-4 rounded-xl border bg-white p-3"><img src={qr} alt="QR fijo PAPAMERICANA" className="mx-auto aspect-square w-full max-w-[230px] object-contain"/></div><a href={qr} target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#ffd21c] px-4 py-3 text-xs font-black text-black"><Printer size={15}/> Abrir QR para imprimir <ExternalLink size={13}/></a><p className="mt-3 text-[10px] leading-4 text-neutral-400">El QR apunta al acceso de Mi cuenta para sellar. La validación de sesión y el registro seguro del sello deben estar activos antes de exhibirlo al público.</p></aside>
  </section>
 </div>;
}
