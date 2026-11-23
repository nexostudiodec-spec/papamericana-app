import Link from 'next/link';
import { ArrowLeft, ClipboardList, Package, Users, TrendingUp, ShoppingCart, Clock3, Utensils, Tags, ImagePlus, Settings, Truck, LogOut, Images } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signOut } from '@/app/login/actions';

const modules = [
  { href:'/admin/products', label:'Productos y menú', desc:'Crear productos, cargar fotografías, editar precios y disponibilidad.', icon:Package },
  { href:'/admin/categories', label:'Categorías', desc:'Organizar hamburguesas, salchipapas, hot dogs, combos y bebidas.', icon:Tags },
  { href:'/admin/orders', label:'Pedidos', desc:'Revisar pedidos, cambiar estados y gestionar preparación.', icon:ClipboardList },
  { href:'/admin/delivery', label:'Entregas', desc:'Configurar retiro en local, zonas y tarifas de delivery.', icon:Truck },
  { href:'/admin/customers', label:'Clientes', desc:'Consultar clientes y su historial de compras.', icon:Users },
  { href:'/admin/banners', label:'Banners y diapositivas', desc:'Editar el carrusel principal y administrar hasta 20 diapositivas.', icon:Images },
  { href:'/admin/settings', label:'Configuración', desc:'Datos del restaurante, horarios y preferencias.', icon:Settings },
];
const stats = [{label:'Pedidos de hoy',value:'—',icon:ShoppingCart},{label:'Ventas del día',value:'—',icon:TrendingUp},{label:'Productos activos',value:'—',icon:Package},{label:'Clientes',value:'—',icon:Users}];

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const [{ count: productCount }, { count: orderCount }, { count: customerCount }, { data: recentOrders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('id,order_number,customer_name,total,status,created_at').order('created_at', { ascending: false }).limit(5),
  ]);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });
  const { count: todayOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today + 'T00:00:00-05:00').lt('created_at', today + 'T23:59:59-05:00');
  const stats = [{label:'Pedidos de hoy',value:String(todayOrders ?? 0),icon:ShoppingCart},{label:'Pedidos registrados',value:String(orderCount ?? 0),icon:TrendingUp},{label:'Productos activos',value:String(productCount ?? 0),icon:Package},{label:'Clientes',value:String(customerCount ?? 0),icon:Users}];
  return <div className="mx-auto max-w-[1500px]">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">PAPAMERICANA / RESUMEN</p><h2 className="mt-1 text-2xl font-black text-[#17233a]">Resumen del restaurante</h2><p className="mt-1 text-sm text-slate-500">Administra tu menú, pedidos y servicio.</p></div><Link href="/admin/products?new=1" className="flex items-center gap-2 rounded-full bg-[#ffd21c] px-5 py-3 text-xs font-black text-black transition-colors hover:bg-black hover:text-[#ffd21c]"><ImagePlus size={16}/> Gestionar menú</Link></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(s=><article key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between text-sm font-semibold text-slate-500"><span>{s.label}</span><s.icon size={18}/></div><div className="mt-5 text-3xl font-black text-[#17233a]">{s.value}</div><div className="mt-2 text-xs text-slate-400">Datos consultados en Supabase</div></article>)}</div>
    <div className="mt-8"><div className="mb-4"><h3 className="text-lg font-black text-[#17233a]">Gestión del restaurante</h3><p className="mt-1 text-xs text-slate-500">Accede a los módulos de operación.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map(m=><Link key={m.href} href={m.href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-150 hover:border-[#e5b900]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff2b5] text-black"><m.icon size={20}/></div><h4 className="mt-4 font-black text-[#17233a]">{m.label}</h4><p className="mt-2 text-xs leading-5 text-slate-500">{m.desc}</p><span className="mt-4 inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#987500]">Abrir módulo →</span></Link>)}</div></div>
    <article className="mt-7 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-2 font-extrabold text-[#17233a]"><ClipboardList size={18}/> Actividad reciente</div><div className="mt-5 divide-y divide-slate-100">{(recentOrders ?? []).length ? recentOrders!.map(o=><div key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"><div><b>Pedido #{o.order_number}</b><div className="mt-1 text-slate-500">{o.customer_name} · {o.status}</div></div><b>${Number(o.total).toFixed(2)}</b></div>) : <div className="grid min-h-28 place-items-center text-center"><div><Clock3 size={22} className="mx-auto text-slate-400"/><div className="mt-2 font-bold">Aún no hay pedidos</div><p className="mt-1 text-xs text-slate-400">Los nuevos pedidos aparecerán aquí.</p></div></div>}</div></article>
  </div>;
}
