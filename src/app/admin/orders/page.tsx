import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import OrdersBoard from './orders-board';

export const dynamic='force-dynamic';
export default async function OrdersPage(){
 const s=await createSupabaseServerClient();if(!s)return null;
 const {data:orders,error}=await s.from('orders').select('id,order_number,customer_name,customer_phone,fulfillment_type,delivery_address,status,payment_method,payment_status,total,created_at').order('created_at',{ascending:false}).limit(150);
 return <main className="min-h-screen bg-[#f6f6f3] px-4 py-8 text-neutral-900 sm:px-8"><div className="mx-auto max-w-[1800px]"><Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500"><ArrowLeft size={15}/> Panel</Link><div className="mt-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-neutral-400">PAPAMERICANA / OPERACIÓN</p><h1 className="mt-1 text-3xl font-black">Pedidos</h1><p className="mt-1 text-sm text-neutral-500">Organiza la preparación y entrega de cada pedido en tiempo real.</p></div><span className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold">Tablero Kanban · Actualización automática</span></div>{error?<p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">No se pudieron cargar los pedidos. Verifica los permisos de Supabase.</p>:<OrdersBoard initialOrders={(orders??[]).map(o=>({...o,total:Number(o.total)}))}/>}</div></main>;
}
