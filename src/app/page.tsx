import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  ArrowRight, Search, ShoppingBag, MapPin, Clock3, ShieldCheck,
  Truck, Menu, ChevronRight, PackageCheck, Sparkles,
} from 'lucide-react';

type ProductCard = {
  id: string;
  name: string;
  category: string;
  price: string;
  tag: string;
  tone: string;
  mark: string;
  image_url: string | null;
};

const fallbackProducts: ProductCard[] = [
  { id: 'demo-1', name: 'Producto destacado 01', category: 'Despensa', price: '—', tag: 'DESTACADO', tone: 'bg-amber-100', mark: '01', image_url: null },
  { id: 'demo-2', name: 'Producto destacado 02', category: 'Bebidas', price: '—', tag: 'POPULAR', tone: 'bg-sky-100', mark: '02', image_url: null },
  { id: 'demo-3', name: 'Producto destacado 03', category: 'Hogar', price: '—', tag: 'NOVEDAD', tone: 'bg-emerald-100', mark: '03', image_url: null },
  { id: 'demo-4', name: 'Producto destacado 04', category: 'Cuidado personal', price: '—', tag: 'RECOMENDADO', tone: 'bg-rose-100', mark: '04', image_url: null },
];

export default async function Home() {
  const supabase = createSupabaseServerClient();
  let categories = ['Todos los productos', 'Despensa', 'Bebidas', 'Hogar', 'Cuidado personal'];
  let products: ProductCard[] = fallbackProducts;
  let hasLiveProducts = false;

  if (supabase) {
    const [{ data: categoryRows }, { data: productRows }] = await Promise.all([
      supabase.from('categories').select('id,name').eq('is_active', true).order('sort_order'),
      supabase.from('products').select('id,name,price,image_url,category_id,is_featured').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
    ]);

    if (categoryRows?.length) {
      categories = ['Todos los productos', ...categoryRows.map((category) => category.name)];
    }

    if (productRows?.length) {
      const categoryNames = new Map((categoryRows ?? []).map((category) => [category.id, category.name]));
      products = productRows.map((product, index) => ({
        id: product.id,
        name: product.name,
        category: (product.category_id ? categoryNames.get(product.category_id) : undefined) ?? 'Productos',
        price: '$' + Number(product.price).toFixed(2),
        tag: product.is_featured ? 'DESTACADO' : 'DISPONIBLE',
        tone: ['bg-amber-100', 'bg-sky-100', 'bg-emerald-100', 'bg-rose-100'][index % 4],
        mark: String(index + 1).padStart(2, '0'),
        image_url: product.image_url,
      }));
      hasLiveProducts = true;
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="bg-[#17233a] px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">Pide en línea y recibe en casa · Atención cercana y rápida</div>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f7f7f4]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f3c623] text-lg font-black text-[#17233a]">P</div>
            <div><div className="text-xl font-black tracking-tight">PAPAMERICANA</div><div className="text-[10px] font-bold uppercase tracking-[.22em] text-slate-500">Tu tienda de confianza</div></div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#catalogo" className="hover:text-slate-950">Catálogo</a><a href="#beneficios" className="hover:text-slate-950">Beneficios</a><a href="#como-comprar" className="hover:text-slate-950">Cómo comprar</a>
          </nav>
          <div className="flex items-center gap-2">
            <button aria-label="Buscar" className="hidden rounded-full border border-slate-200 p-3 hover:bg-white sm:block"><Search size={18}/></button>
            <button className="flex items-center gap-2 rounded-full bg-[#17233a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#293b5b]"><ShoppingBag size={17}/><span className="hidden sm:inline">Mi carrito</span><span className="grid h-5 w-5 place-items-center rounded-full bg-[#f3c623] text-[11px] text-[#17233a]">0</span></button>
            <button aria-label="Abrir menú" className="rounded-full border border-slate-200 p-3 md:hidden"><Menu size={18}/></button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-[.12em] text-amber-900"><Sparkles size={14}/> Tu compra, más sencilla</div>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.03] tracking-[-.055em] text-[#17233a] sm:text-6xl lg:text-7xl">Lo que necesitas, <span className="relative inline-block">a un clic.<span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -rotate-1 bg-[#f3c623] sm:h-4"/></span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Descubre productos, arma tu pedido y recibe tus compras de forma fácil y cómoda.</p>
          <div className="mt-9 flex flex-wrap gap-3"><a href="#catalogo" className="inline-flex items-center gap-3 rounded-full bg-[#17233a] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#293b5b]">Explorar catálogo <ArrowRight size={17}/></a><a href="#como-comprar" className="rounded-full border border-slate-300 px-7 py-4 text-sm font-bold text-[#17233a] transition hover:bg-white">Cómo comprar</a></div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-slate-500"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-600"/> Compra segura</span><span className="flex items-center gap-2"><Truck size={17} className="text-emerald-600"/> Entrega a domicilio</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#f3c623]/30 blur-3xl"/>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#e9e8df] p-6 sm:p-9">
            <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border-[28px] border-white/40"/>
            <div className="relative flex min-h-[330px] flex-col justify-between rounded-[1.5rem] bg-[#f3c623] p-7 sm:min-h-[390px] sm:p-9">
              <div className="flex items-start justify-between"><span className="rounded-full bg-[#17233a] px-4 py-2 text-[10px] font-black uppercase tracking-[.2em] text-white">PAPAMERICANA</span><PackageCheck size={28} className="text-[#17233a]"/></div>
              <div><div className="text-[clamp(3.5rem,9vw,6.5rem)] font-black leading-[.85] tracking-[-.08em] text-[#17233a]">TODO<br/>AQUÍ.</div><p className="mt-5 max-w-xs text-sm font-semibold leading-6 text-[#17233a]/75">Una experiencia de compra práctica, desde donde estés.</p></div>
              <div className="flex items-center justify-between border-t border-[#17233a]/15 pt-4 text-xs font-bold uppercase tracking-wider text-[#17233a]"><span>Compra fácil</span><span>Entrega cómoda ↗</span></div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/10 sm:-left-8"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><MapPin size={20}/></div><div><div className="text-xs font-bold text-slate-400">TU PEDIDO</div><div className="text-sm font-extrabold">Hasta tu puerta</div></div></div></div>
        </div>
      </section>

      <section id="catalogo" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-xs font-black uppercase tracking-[.2em] text-amber-600">Encuentra lo que buscas</div><h2 className="mt-3 text-3xl font-black tracking-tight text-[#17233a] sm:text-4xl">Explora nuestro catálogo</h2><p className="mt-3 text-slate-500">Una selección de productos para tu día a día.</p></div><a href="#catalogo" className="hidden items-center gap-2 text-sm font-bold text-[#17233a] sm:flex">Ver catálogo completo <ArrowRight size={16}/></a></div>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">{categories.map((category, index) => <button key={category} className={index === 0 ? 'shrink-0 rounded-full bg-[#17233a] px-5 py-3 text-xs font-bold text-white' : 'shrink-0 rounded-full bg-[#f3f4f1] px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-200'}>{category}</button>)}</div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => <article key={product.id} className="group rounded-[1.5rem] border border-slate-100 bg-white p-3 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
              <div className={'relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.1rem] ' + product.tone}>
                {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover"/> : <span className="text-6xl font-black tracking-tighter text-[#17233a]/15">{product.mark}</span>}
                <span className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1.5 text-[9px] font-black tracking-widest text-slate-600">{product.tag}</span>
              </div>
              <div className="px-2 pb-2 pt-4"><div className="text-xs font-semibold text-slate-400">{product.category}</div><h3 className="mt-1 font-extrabold text-[#17233a]">{product.name}</h3><div className="mt-4 flex items-center justify-between"><span className="text-sm font-bold text-slate-700">{product.price === '—' ? 'Precio por confirmar' : product.price}</span><button aria-label={'Añadir ' + product.name} className="grid h-10 w-10 place-items-center rounded-full bg-[#f3c623] text-[#17233a] transition group-hover:rotate-90"><ShoppingBag size={17}/></button></div></div>
            </article>)}
          </div>
          {!hasLiveProducts && <p className="mt-5 text-xs text-slate-400">Vista inicial de demostración: productos, fotografías y precios se reemplazarán con el catálogo real de PAPAMERICANA.</p>}
        </div>
      </section>

      <section id="beneficios" className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="grid gap-4 md:grid-cols-3">
        {[{ icon: Truck, title: 'Entrega a domicilio', desc: 'Recibe tu pedido donde te encuentres.' }, { icon: Clock3, title: 'Compra en cualquier momento', desc: 'Arma tu pedido de forma cómoda y sencilla.' }, { icon: ShieldCheck, title: 'Atención confiable', desc: 'Información clara y acompañamiento en tu compra.' }].map((item) => <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-7"><item.icon size={24} className="text-amber-600"/><h3 className="mt-5 text-lg font-extrabold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p></div>)}
      </div></section>

      <section id="como-comprar" className="bg-[#17233a] py-16 text-white sm:py-20"><div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8">
        <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#f3c623]">Así de fácil</div><h2 className="mt-4 max-w-lg text-4xl font-black tracking-tight sm:text-5xl">Tu compra en pocos pasos.</h2><p className="mt-5 max-w-md leading-7 text-slate-300">Estamos preparando una experiencia para que puedas elegir, confirmar y seguir tu pedido desde un solo lugar.</p><a href="#catalogo" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f3c623] px-6 py-4 text-sm font-black text-[#17233a]">Empezar a explorar <ArrowRight size={16}/></a></div>
        <div className="space-y-3">{[{ n: '01', title: 'Explora', desc: 'Encuentra los productos que necesitas.' }, { n: '02', title: 'Arma tu pedido', desc: 'Añade productos y revisa tu carrito.' }, { n: '03', title: 'Confirma', desc: 'Elige entrega o retiro y tu forma de pago.' }, { n: '04', title: 'Recibe', desc: 'Consulta el estado de tu pedido.' }].map((step) => <div key={step.n} className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5"><div className="text-2xl font-black text-[#f3c623]">{step.n}</div><div><div className="font-extrabold">{step.title}</div><div className="mt-1 text-sm text-slate-400">{step.desc}</div></div><ChevronRight className="ml-auto text-slate-500" size={18}/></div>)}</div>
      </div></section>

      <footer className="bg-[#101a2c] px-5 py-8 text-sm text-slate-400"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><div className="font-black tracking-wider text-white">PAPAMERICANA</div><div>© {new Date().getFullYear()} PAPAMERICANA. Todos los derechos reservados.</div><Link href="/admin" className="font-semibold hover:text-white">Administración <span aria-hidden="true">↗</span></Link></div></footer>
    </main>
  );
}
