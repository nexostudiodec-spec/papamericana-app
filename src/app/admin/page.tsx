import Link from 'next/link';
import { ClipboardList, Package, Users, Clock3, CheckCircle2, XCircle, Truck, Wallet, ChefHat } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const statusLabels:Record<string,string>={pending:'Pendientes',confirmed:'Confirmados',preparing:'En preparación',ready:'Listos para retirar',out_for_delivery:'En camino',completed:'Completados',cancelled:'Cancelados'};
const statusIcons:Record<string,any>={pending:Clock3,confirmed:CheckCircle2,preparing:ChefHat,ready:CheckCircle2,out_for_delivery:Truck,completed:CheckCircle2,cancelled:XCircle};

export default async function AdminPage() {
 const s=await createSupabaseServerClient(); if(!s)return null;
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Guayaquil'});
 const start=today+'T00:00:00-05:00', end=today+'T23:59:59-05:00';
 const [{data:todayOrders},{data:allOrders},{count:productCount},{count:customerCount},{data:recentOrders}]=await Promise.all([
  s.from('orders').select('id,status,total,payment_status,created_at').gte('created_at',start).lt('created_at',end),
  s.from('orders').select('id,status,total,payment_status'),
  s.from('products').select('*',{count:'exact',head:true}).eq('is_active',true),
  s.from('customers').select('*',{count:'exact',head:true}),
  s.from('orders').select('id,order_number,customer_name,total,status,created_at').order('created_at',{ascending:false}).limit(8)
 ]);
 const todayList=todayOrders??[], all=allOrders??[];
 const revenue=todayList.filter(o=>o.payment_status==='paid'||o.status==='completed').reduce((a,o)=>a+Number(o.total),0);
 const statusCounts=all.reduce((acc,o)=>{acc[o.status]=(acc[o.status]??0)+1;return acc;},{} as Record<string,number>);
 const cards=[
  {label:'Pedidos de hoy',value:String(todayList.length),icon:ClipboardList},
  {label:'Ingresos recibidos hoy',value:'$'+revenue.toFixed(2),icon:Wallet},
  {label:'Productos activos',value:String(productCount??0),icon:Package},
  {label:'Clientes registrados',value:String(customerCount??0),icon:Users}
 ];
 return <div className="mx-auto max-w-[1500px]">
  <div className="mb-7"><p className="text-[10px] font-black uppercase tracking-[.18em] text-neutral-400">PAPAMERICANA / RESUMEN</p><h1 className="mt-1 text-2xl font-black text-black">Resumen del restaurante</h1><p className="mt-1 text-sm text-neutral-500">Indicadores de ventas y operación del restaurante.</p></div>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=><article key={c.label} className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="flex items-center justify-between text-sm font-semibold text-neutral-500"><span>{c.label}</span><c.icon size={18}/></div><div className="mt-4 text-3xl font-black text-black">{c.value}</div></article>)}</div>
  <section className="mt-8"><div className="mb-4"><h2 className="text-lg font-black text-black">Estado de los pedidos</h2><p className="mt-1 text-xs text-neutral-500">Distribución de todos los pedidos registrados.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(statusLabels).map(([key,label])=>{const Icon=statusIcons[key];return <Link key={key} href="/admin/orders" className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-[#ffd21c]"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff2b5]"><Icon size={18}/></div><span className="text-sm font-semibold">{label}</span></div><b className="text-xl">{statusCounts[key]??0}</b></Link>})}</div></section>
  <article className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6"><div className="flex items-center justify-between"><div className="font-extrabold text-black"><ClipboardList size={18} className="mr-2 inline"/> Pedidos recientes</div><Link href="/admin/orders" className="text-xs font-bold text-neutral-500 hover:text-black">Ver todos →</Link></div><div className="mt-4 divide-y divide-neutral-100">{(recentOrders??[]).map(o=><div key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"><div><b>Pedido #{o.order_number}</b><p className="mt-1 text-neutral-500">{o.customer_name} · {statusLabels[o.status]??o.status} · {new Date(o.created_at).toLocaleString('es-EC')}</p></div><b>${Number(o.total).toFixed(2)}</b></div>)}{!(recentOrders??[]).length&&<div className="grid min-h-28 place-items-center text-center"><div><Clock3 size={22} className="mx-auto text-neutral-400"/><p className="mt-2 font-bold">Aún no hay pedidos</p></div></div>}</div></article>
 </div>;
}
