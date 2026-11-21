import Link from 'next/link';
import { ArrowLeft, ClipboardList, Package, Users, TrendingUp, ShoppingCart, Clock3, Utensils, Tags, ImagePlus, Settings, Truck } from 'lucide-react';

const modules = [
  { href:'/admin/products', label:'Productos y menú', desc:'Crear productos, cargar fotografías, editar precios y disponibilidad.', icon:Package },
  { href:'/admin/categories', label:'Categorías', desc:'Organizar hamburguesas, salchipapas, hot dogs, combos y bebidas.', icon:Tags },
  { href:'/admin/orders', label:'Pedidos', desc:'Revisar pedidos, cambiar estados y gestionar preparación.', icon:ClipboardList },
  { href:'/admin/delivery', label:'Entregas', desc:'Configurar retiro en local, zonas y tarifas de delivery.', icon:Truck },
  { href:'/admin/customers', label:'Clientes', desc:'Consultar clientes y su historial de compras.', icon:Users },
  { href:'/admin/settings', label:'Configuración', desc:'Datos del restaurante, horarios y preferencias.', icon:Settings },
];
const stats = [{label:'Pedidos de hoy',value:'—',icon:ShoppingCart},{label:'Ventas del día',value:'—',icon:TrendingUp},{label:'Productos activos',value:'—',icon:Package},{label:'Clientes',value:'—',icon:Users}];

export default function AdminPage() {
  return <main className="min-h-screen bg-[#f5f6f8] text-[#17233a]">
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#17233a] p-6 text-white md:flex">
      <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3c623] font-black text-[#17233a]">P</span><span className="font-black tracking-wide">PAPAMERICANA</span></Link>
      <div className="mt-12 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Administración</div>
      <div className="mt-4 space-y-2"><div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white"><TrendingUp size={17}/> Resumen</div>{modules.map(x=><Link href={x.href} key={x.label} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"><x.icon size={17}/>{x.label}</Link>)}</div>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs font-bold text-[#f3c623]">PANEL DEL RESTAURANTE</div><p className="mt-2 text-xs leading-5 text-slate-400">Gestiona el menú y la operación de PAPAMERICANA.</p></div>
    </aside>
    <section className="md:ml-64">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5"><div><div className="text-xs font-semibold text-slate-400">PAPAMERICANA / ADMIN</div><h1 className="mt-1 text-xl font-black">Panel de administración</h1></div><Link href="/" className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold"><ArrowLeft size={15}/> Ver tienda</Link></header>
      <div className="p-6 lg:p-9"><div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-black">Resumen del restaurante</h2><p className="mt-1 text-sm text-slate-500">Administra tu menú, pedidos y servicio.</p></div><Link href="/admin/products" className="flex items-center gap-2 rounded-full bg-[#f3c623] px-5 py-3 text-xs font-black text-[#17233a]"><ImagePlus size={16}/> Gestionar menú</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(s=><article key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between text-sm font-semibold text-slate-500"><span>{s.label}</span><s.icon size={18}/></div><div className="mt-5 text-3xl font-black">{s.value}</div><div className="mt-2 text-xs text-slate-400">Los datos se mostrarán con pedidos reales</div></article>)}</div>
        <div className="mt-8"><div className="mb-4"><h3 className="text-lg font-black">Gestión del restaurante</h3><p className="mt-1 text-xs text-slate-500">Accede a los módulos de operación.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map(m=><Link key={m.href} href={m.href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#e9bf18] hover:shadow-lg"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff4bf] text-[#17233a]"><m.icon size={20}/></div><h4 className="mt-4 font-black">{m.label}</h4><p className="mt-2 text-xs leading-5 text-slate-500">{m.desc}</p><span className="mt-4 inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#987500]">Abrir módulo →</span></Link>)}</div></div>
        <article className="mt-7 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-2 font-extrabold"><ClipboardList size={18}/> Actividad reciente</div><div className="mt-8 grid min-h-32 place-items-center text-center"><div><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100"><Clock3 size={22} className="text-slate-500"/></div><div className="mt-3 font-bold">Aún no hay pedidos</div><p className="mt-1 text-sm text-slate-400">Los pedidos nuevos se mostrarán en este panel.</p></div></div></article>
      </div>
    </section>
  </main>;
}
