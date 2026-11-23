'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { updateOrderStatus } from './actions';
import { Bike, CheckCircle2, Clock3, GripVertical, MapPin, PackageCheck, Phone, ShoppingBag, Truck, XCircle } from 'lucide-react';

type Order = { id:string; order_number:number; customer_name:string; customer_phone:string; fulfillment_type:string; delivery_address:string|null; status:string; payment_method:string; payment_status:string; total:number; created_at:string };
const stages = [
 {id:'pending',label:'Pendientes',icon:Clock3,tone:'border-amber-300 bg-amber-50',dot:'bg-amber-400'},
 {id:'confirmed',label:'Confirmados',icon:CheckCircle2,tone:'border-sky-200 bg-sky-50',dot:'bg-sky-500'},
 {id:'preparing',label:'En preparación',icon:ShoppingBag,tone:'border-orange-200 bg-orange-50',dot:'bg-orange-500'},
 {id:'ready',label:'Listos',icon:PackageCheck,tone:'border-violet-200 bg-violet-50',dot:'bg-violet-500'},
 {id:'out_for_delivery',label:'En camino',icon:Truck,tone:'border-indigo-200 bg-indigo-50',dot:'bg-indigo-500'},
 {id:'completed',label:'Completados',icon:CheckCircle2,tone:'border-emerald-200 bg-emerald-50',dot:'bg-emerald-500'},
 {id:'cancelled',label:'Cancelados',icon:XCircle,tone:'border-rose-200 bg-rose-50',dot:'bg-rose-500'},
];
const money=(n:number)=>'$'+Number(n||0).toFixed(2);
export default function OrdersBoard({initialOrders}:{initialOrders:Order[]}) {
 const [orders,setOrders]=useState(initialOrders);
 const [newIds,setNewIds]=useState<string[]>([]);
 const [moving,setMoving]=useState<string|null>(null);
 const [dragging,setDragging]=useState<string|null>(null);
 const [notice,setNotice]=useState('');
 const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);
 const move=useCallback(async(id:string,status:string)=>{
   const previous=orders.find(o=>o.id===id); if(!previous||previous.status===status)return;
   setMoving(id); setOrders(current=>current.map(o=>o.id===id?{...o,status}:o));
   const fd=new FormData();fd.set('id',id);fd.set('status',status);
   const result=await updateOrderStatus(fd);
   if(!result?.ok){setOrders(current=>current.map(o=>o.id===id?{...o,status:previous.status}:o));setNotice('No se pudo actualizar el pedido. Intenta otra vez.');}
   else setNotice('Pedido #'+previous.order_number+' movido a '+(stages.find(s=>s.id===status)?.label??status)+'.');
   setMoving(null);window.setTimeout(()=>setNotice(''),3500);
 },[orders]);
 useEffect(()=>{
  const channel=supabase.channel('admin-orders-kanban')
   .on('postgres_changes',{event:'INSERT',schema:'public',table:'orders'},payload=>{
    const incoming=payload.new as Order;
    setOrders(current=>current.some(o=>o.id===incoming.id)?current:[incoming,...current]);
    setNewIds(current=>[incoming.id,...current]);
    setNotice('¡Nuevo pedido #'+incoming.order_number+' recibido!');
    if('vibrate' in navigator) navigator.vibrate?.([180,90,180,90,300]);
    window.setTimeout(()=>setNewIds(current=>current.filter(id=>id!==incoming.id)),18000);
    window.setTimeout(()=>setNotice(''),7000);
   })
   .on('postgres_changes',{event:'UPDATE',schema:'public',table:'orders'},payload=>{
    const updated=payload.new as Order;
    setOrders(current=>current.map(o=>o.id===updated.id?{...o,...updated}:o));
   })
   .subscribe();
  return()=>{void supabase.removeChannel(channel);};
 },[supabase]);
 const counts=useMemo(()=>Object.fromEntries(stages.map(s=>[s.id,orders.filter(o=>o.status===s.id).length])),[orders]);
 return <div className="mt-6">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-neutral-500">Arrastra cada pedido a otra columna o cambia su estado desde la tarjeta. Los estados no avanzan solos.</p><div className="flex gap-2 text-[11px] font-bold"><span className="rounded-full bg-white px-3 py-2">{orders.length} pedidos</span><span className="rounded-full bg-amber-100 px-3 py-2 text-amber-800">{counts.pending??0} pendientes</span></div></div>
  {notice&&<div role="status" className="mb-4 rounded-xl border border-[#ffd21c] bg-[#fff8cf] px-4 py-3 text-xs font-bold text-black">{notice}</div>}
  <div className="flex items-start gap-4 overflow-x-auto pb-5">
   {stages.map(stage=>{const Icon=stage.icon;const list=orders.filter(o=>o.status===stage.id);return <section key={stage.id} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragging)void move(dragging,stage.id);setDragging(null);}} className="w-[290px] min-w-[290px] rounded-2xl border border-neutral-200 bg-[#eeefec] p-3">
    <header className={'mb-3 flex items-center justify-between rounded-xl border px-3 py-3 '+stage.tone}><div className="flex items-center gap-2"><Icon size={16}/><h2 className="text-xs font-black">{stage.label}</h2></div><span className="grid h-6 min-w-6 place-items-center rounded-full bg-white px-1 text-[10px] font-black">{list.length}</span></header>
    <div className="min-h-[180px] space-y-3">
     {list.map(order=><article key={order.id} draggable onDragStart={()=>setDragging(order.id)} onDragEnd={()=>setDragging(null)} className={'rounded-xl border bg-white p-4 shadow-sm transition '+(newIds.includes(order.id)?'new-order-alert border-[#ffd21c] ring-2 ring-[#ffd21c]/70':'border-neutral-200')+(moving===order.id?' opacity-60':'')}>
      <div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-black text-neutral-400">PEDIDO #{order.order_number}</p><p className="mt-1 text-sm font-black leading-tight">{order.customer_name}</p></div><GripVertical size={16} className="shrink-0 cursor-grab text-neutral-300"/></div>
      {newIds.includes(order.id)&&<span className="mt-2 inline-flex rounded-full bg-[#ffe600] px-2 py-1 text-[9px] font-black uppercase">¡Nuevo pedido!</span>}
      <p className="mt-2 flex items-center gap-1 text-[10px] text-neutral-500"><Phone size={11}/>{order.customer_phone}</p>
      <p className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500">{order.fulfillment_type==='pickup'?<ShoppingBag size={11}/>:<Bike size={11}/>} {order.fulfillment_type==='pickup'?'Retiro en local':'Delivery'}</p>
      {order.delivery_address&&<p className="mt-1 flex items-start gap-1 text-[10px] text-neutral-500"><MapPin size={11} className="mt-0.5 shrink-0"/>{order.delivery_address}</p>}
      <div className="mt-3 flex items-end justify-between border-t border-neutral-100 pt-3"><div><p className="text-lg font-black">{money(order.total)}</p><p className="text-[9px] text-neutral-400">{order.payment_method==='cash'?'Efectivo':'Transferencia'} · {order.payment_status==='paid'?'Pagado':'Pendiente pago'}</p></div><p className="text-[9px] text-neutral-400">{new Date(order.created_at).toLocaleTimeString('es-EC',{hour:'2-digit',minute:'2-digit'})}</p></div>
      <label className="mt-3 block text-[10px] font-bold text-neutral-500">Mover a estado<select aria-label={'Cambiar estado del pedido '+order.order_number} value={order.status} disabled={moving===order.id} onChange={e=>void move(order.id,e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs font-bold text-neutral-800">{stages.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
     </article>)}
     {list.length===0&&<div className="rounded-xl border border-dashed border-neutral-300 px-3 py-8 text-center text-[10px] font-semibold text-neutral-400">Suelta aquí los pedidos</div>}
    </div>
   </section>})}
  </div>
 </div>;
}
