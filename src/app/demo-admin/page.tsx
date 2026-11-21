import Link from 'next/link';
import { Package, Tags, ClipboardList, Truck, Users, Settings, Eye, LockKeyhole } from 'lucide-react';

const modules = [
  { slug:'products', title:'Productos y menú', description:'Catálogo, precios, fotografías y disponibilidad.', icon:Package, value:'19 productos de muestra' },
  { slug:'categories', title:'Categorías', description:'Organización del menú del restaurante.', icon:Tags, value:'5 categorías' },
  { slug:'orders', title:'Pedidos', description:'Consulta de pedidos y estados de preparación.', icon:ClipboardList, value:'3 pedidos ficticios' },
  { slug:'delivery', title:'Entregas', description:'Zonas, tarifas y modalidades de entrega.', icon:Truck, value:'2 zonas de ejemplo' },
  { slug:'customers', title:'Clientes', description:'Listado e historial de clientes.', icon:Users, value:'3 clientes ficticios' },
  { slug:'settings', title:'Configuración', description:'Datos generales y preferencias del restaurante.', icon:Settings, value:'Vista de configuración' },
];

export default function DemoAdminPage() {
  return <main className="min-h-screen bg-[#f5f6f8] text-[#17233a]">
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#17233a] p-6 text-white md:flex">
      <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3c623] font-black text-[#17233a]">P</span><span className="font-black tracking-wide">PAPAMERICANA</span></Link>
      <p className="mt-12 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Administración · Demo</p>
      <Link href="/demo-admin" className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold">Resumen</Link>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs font-bold text-[#f3c623]">MODO DEMOSTRACIÓN</div><p className="mt-2 text-xs leading-5 text-slate-400">Datos ficticios. No se realizan cambios en el restaurante.</p></div>
    </aside>
    <section className="md:ml-64">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-5"><div><p className="text-xs font-semibold text-slate-400">PAPAMERICANA / ADMIN / DEMO</p><h1 className="mt-1 text-xl font-black">Panel de administración</h1></div><div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800"><Eye size={14}/> Vista previa sin credenciales</div></header>
      <div className="p-6 lg:p-9"><div className="mb-7"><h2 className="text-2xl font-black">Resumen del restaurante</h2><p className="mt-1 text-sm text-slate-500">Explora la estructura y los módulos del administrador.</p></div>
        <div className="mb-7 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><LockKeyhole size={20} className="mt-0.5 shrink-0"/><div><b className="text-sm">Modo de solo lectura</b><p className="mt-1 text-xs leading-5">Esta demostración utiliza información de ejemplo. Los formularios y acciones de escritura están deshabilitados; nada se guarda en Supabase.</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Pedidos de hoy','3'],['Ventas de muestra','$42.50'],['Productos de muestra','19'],['Clientes de muestra','3']].map(([label,value])=><article key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-4 text-3xl font-black">{value}</p><p className="mt-2 text-xs text-slate-400">Datos ficticios</p></article>)}</div>
        <div className="mt-8"><h3 className="text-lg font-black">Gestión del restaurante</h3><p className="mt-1 text-xs text-slate-500">Selecciona un módulo para conocer su contenido.</p><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map(m=><Link key={m.slug} href={'/demo-admin/'+m.slug} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#e9bf18] hover:shadow-md"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff4bf]"><m.icon size={20}/></div><h4 className="mt-4 font-black">{m.title}</h4><p className="mt-2 text-xs leading-5 text-slate-500">{m.description}</p><p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-[#987500]">{m.value}</p><span className="mt-4 inline-block text-xs font-extrabold">Explorar módulo →</span></Link>)}</div></div>
      </div>
    </section>
  </main>;
}
