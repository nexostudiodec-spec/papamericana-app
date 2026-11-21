'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight, Search, ShoppingBag, MapPin, ShieldCheck, Truck, Menu, X,
  PackageCheck, Sparkles, Plus, Minus, Trash2, ShoppingBasket, Heart,
} from 'lucide-react';

export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  tag: string;
  image_url: string | null;
};

type Props = { categories: string[]; products: StoreProduct[]; hasLiveProducts: boolean };
type CartLine = { product: StoreProduct; quantity: number };

const money = (value: number) => '$' + Number(value || 0).toFixed(2);

export default function StorefrontClient({ categories, products, hasLiveProducts }: Props) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);

  const filtered = useMemo(() => products.filter((p) => {
    const categoryMatch = activeCategory === 'Todos' || p.category === activeCategory;
    const searchMatch = p.name.toLowerCase().includes(query.trim().toLowerCase());
    return categoryMatch && searchMatch;
  }), [products, activeCategory, query]);

  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  function add(product: StoreProduct) {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      return existing
        ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { product, quantity: 1 }];
    });
    setCartOpen(true);
  }
  function changeQuantity(id: string, amount: number) {
    setCart((current) => current
      .map((line) => line.product.id === id ? { ...line, quantity: line.quantity + amount } : line)
      .filter((line) => line.quantity > 0));
  }
  function remove(id: string) { setCart((current) => current.filter((line) => line.product.id !== id)); }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fafaf7] text-[#151515]">
      <div className="bg-[#151515] px-4 py-2.5 text-center text-[11px] font-semibold tracking-[.12em] text-white sm:text-xs">PIDE EN LÍNEA · RECIBE EN CASA · ATENCIÓN CERCANA Y RÁPIDA</div>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <a href="#" className="flex shrink-0 items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f5c900] text-xl font-black text-black shadow-sm">P</span>
            <span><span className="block text-lg font-black leading-none tracking-[-.04em] sm:text-xl">PAPAMERICANA</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.24em] text-neutral-500">Tu tienda de confianza</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-bold text-neutral-600 md:flex">
            <a href="#catalogo" className="transition hover:text-black">Catálogo</a><a href="#beneficios" className="transition hover:text-black">Beneficios</a><a href="#como-comprar" className="transition hover:text-black">Cómo comprar</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen((v) => !v)} aria-label="Buscar productos" className="grid h-11 w-11 place-items-center rounded-full border border-neutral-200 bg-white transition hover:border-black"><Search size={18}/></button>
            <button onClick={() => setCartOpen(true)} className="flex h-11 items-center gap-2 rounded-full bg-black px-4 text-sm font-bold text-white transition hover:bg-neutral-800"><ShoppingBag size={17}/><span className="hidden sm:inline">Mi carrito</span><span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#f5c900] px-1 text-[11px] font-black text-black">{count}</span></button>
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Abrir menú" className="grid h-11 w-11 place-items-center rounded-full border border-neutral-200 md:hidden">{mobileOpen ? <X size={18}/> : <Menu size={18}/>}</button>
          </div>
        </div>
        {searchOpen && <div className="border-t border-neutral-100 bg-white px-5 py-3"><div className="mx-auto flex max-w-7xl items-center gap-3"><Search size={18} className="text-neutral-400"/><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca productos por nombre..." className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-neutral-400"/>{query && <button onClick={() => setQuery('')} className="text-xs font-bold text-neutral-500">Limpiar</button>}</div></div>}
        {mobileOpen && <nav className="grid gap-1 border-t border-neutral-100 bg-white px-5 py-3 text-sm font-bold md:hidden"><a onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 hover:bg-neutral-50" href="#catalogo">Catálogo</a><a onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 hover:bg-neutral-50" href="#beneficios">Beneficios</a><a onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 hover:bg-neutral-50" href="#como-comprar">Cómo comprar</a></nav>}
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5c900]/60 bg-[#fff8cf] px-4 py-2 text-[10px] font-black uppercase tracking-[.16em] text-black"><Sparkles size={14}/> Tu compra, más sencilla</div>
          <h1 className="max-w-2xl text-[3.2rem] font-black leading-[.98] tracking-[-.065em] sm:text-6xl lg:text-[4.8rem]">Todo lo que buscas.<br/><span className="relative inline-block">Todo más fácil.<span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -rotate-1 bg-[#f5c900] sm:h-4"/></span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">Haz tus compras desde donde estés. Explora el catálogo, arma tu pedido y recibe todo cómodamente en casa.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="#catalogo" className="inline-flex items-center gap-3 rounded-full bg-black px-7 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-neutral-800">Explorar catálogo <ArrowRight size={17}/></a><a href="#como-comprar" className="rounded-full border border-neutral-300 bg-white px-7 py-4 text-sm font-bold text-black transition hover:border-black">Cómo comprar</a></div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-bold text-neutral-500"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-black"/> Compra segura</span><span className="flex items-center gap-2"><Truck size={17} className="text-black"/> Entrega a domicilio</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#f5c900]/30 blur-3xl"/>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#f0eee5] p-5 shadow-sm sm:p-8">
            <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border-[28px] border-white/60"/>
            <div className="relative flex min-h-[320px] flex-col justify-between rounded-[1.5rem] bg-[#f5c900] p-7 sm:min-h-[390px] sm:p-9">
              <div className="flex items-start justify-between"><span className="rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[.2em] text-white">PAPAMERICANA</span><PackageCheck size={28}/></div>
              <div><div className="text-[clamp(3.7rem,9vw,6.6rem)] font-black leading-[.82] tracking-[-.09em]">TODO<br/>AQUÍ.</div><p className="mt-5 max-w-xs text-sm font-semibold leading-6 text-black/70">Una experiencia de compra práctica, desde donde estés.</p></div>
              <div className="flex items-center justify-between border-t border-black/15 pt-4 text-[10px] font-black uppercase tracking-wider"><span>Compra fácil</span><span>Entrega cómoda ↗</span></div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white p-4 shadow-xl shadow-black/10 sm:-left-7"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff5bd]"><MapPin size={20}/></div><div><div className="text-[10px] font-bold text-neutral-400">TU PEDIDO</div><div className="text-sm font-extrabold">Hasta tu puerta</div></div></div></div>
        </div>
      </section>

      <section id="catalogo" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-[10px] font-black uppercase tracking-[.22em] text-neutral-500">Encuentra lo que buscas</div><h2 className="mt-3 text-3xl font-black tracking-[-.05em] sm:text-4xl">Explora nuestro catálogo<span className="text-[#e2b900]">.</span></h2><p className="mt-3 text-sm text-neutral-500">Una selección de productos para tu día a día.</p></div><span className="text-xs font-bold text-neutral-400">{filtered.length} productos</span></div>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={activeCategory === category ? 'shrink-0 rounded-full bg-black px-5 py-3 text-xs font-bold text-white shadow-sm' : 'shrink-0 rounded-full bg-[#f4f4f1] px-5 py-3 text-xs font-bold text-neutral-600 transition hover:bg-[#f5c900] hover:text-black'}>{category === 'Todos' ? 'Todos los productos' : category}</button>)}</div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((product, index) => <article key={product.id} className="group overflow-hidden rounded-[1.4rem] border border-neutral-100 bg-white p-3 transition hover:-translate-y-1 hover:border-neutral-200 hover:shadow-xl hover:shadow-black/5">
              <div className={'relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.05rem] ' + ['bg-[#fff3bf]','bg-[#f0f0eb]','bg-[#eeeeea]','bg-[#f8f2df]'][index % 4]}>
                {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <ShoppingBasket size={48} className="text-black/15"/>}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black tracking-widest text-black">{product.tag}</span>
              </div>
              <div className="px-2 pb-2 pt-4"><div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{product.category}</div><h3 className="mt-1 min-h-10 font-extrabold text-black">{product.name}</h3><div className="mt-3 flex items-center justify-between"><span className="text-sm font-black text-black">{product.price > 0 ? money(product.price) : 'Precio por confirmar'}</span><button onClick={() => add(product)} disabled={product.price <= 0} aria-label={'Añadir ' + product.name} className="grid h-10 w-10 place-items-center rounded-full bg-[#f5c900] text-black transition hover:rotate-90 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus size={19}/></button></div></div>
            </article>)}
          </div>
          {filtered.length === 0 && <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 py-16 text-center"><Search className="mx-auto text-neutral-300" size={30}/><p className="mt-3 font-bold">No encontramos productos</p><p className="mt-1 text-sm text-neutral-500">Prueba con otra búsqueda o categoría.</p><button onClick={() => { setQuery(''); setActiveCategory('Todos'); }} className="mt-4 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white">Ver todo el catálogo</button></div>}
          {!hasLiveProducts && <p className="mt-5 text-xs text-neutral-400">Catálogo de demostración: los productos y precios reales aparecerán al cargarlos en administración.</p>}
        </div>
      </section>

      <section id="beneficios" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8"><div className="grid gap-4 md:grid-cols-3">
        {[{ icon: Truck, title: 'Entrega a domicilio', desc: 'Recibe tu pedido donde te encuentres.' }, { icon: Heart, title: 'Compra a tu ritmo', desc: 'Elige lo que necesitas de forma cómoda y sencilla.' }, { icon: ShieldCheck, title: 'Atención confiable', desc: 'Información clara y acompañamiento en tu compra.' }].map((item) => <div key={item.title} className="rounded-3xl border border-neutral-200 bg-white p-7"><item.icon size={24}/><h3 className="mt-5 text-lg font-extrabold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-neutral-500">{item.desc}</p></div>)}
      </div></section>

      <section id="como-comprar" className="scroll-mt-24 bg-black py-16 text-white sm:py-20"><div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8">
        <div><div className="text-[10px] font-black uppercase tracking-[.22em] text-[#f5c900]">Así de fácil</div><h2 className="mt-4 max-w-lg text-4xl font-black tracking-[-.05em] sm:text-5xl">Tu compra en pocos pasos.</h2><p className="mt-5 max-w-md text-sm leading-7 text-neutral-300">Estamos preparando una experiencia para que puedas elegir, confirmar y seguir tu pedido desde un solo lugar.</p><a href="#catalogo" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f5c900] px-6 py-4 text-sm font-black text-black transition hover:bg-white">Empezar a explorar <ArrowRight size={16}/></a></div>
        <div className="space-y-3">{[{ n: '01', title: 'Explora', desc: 'Encuentra los productos que necesitas.' }, { n: '02', title: 'Arma tu pedido', desc: 'Añade productos y revisa tu carrito.' }, { n: '03', title: 'Confirma', desc: 'Elige entrega o retiro y tu forma de pago.' }, { n: '04', title: 'Recibe', desc: 'Consulta el estado de tu pedido.' }].map((step) => <div key={step.n} className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5"><div className="text-2xl font-black text-[#f5c900]">{step.n}</div><div><div className="font-extrabold">{step.title}</div><div className="mt-1 text-sm text-neutral-400">{step.desc}</div></div></div>)}</div>
      </div></section>

      <footer className="bg-[#111] px-5 py-8 text-sm text-neutral-400"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><div className="font-black tracking-wider text-white">PAPAMERICANA</div><div>© {new Date().getFullYear()} PAPAMERICANA. Todos los derechos reservados.</div><a href="https://adsgencydigital.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white transition hover:text-[#f5c900]">Creado por Adsgency Digital ↗</a></div></footer>

      {cartOpen && <div className="fixed inset-0 z-50"><button aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"/><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5"><div><div className="text-xs font-bold uppercase tracking-widest text-neutral-400">Tu compra</div><h2 className="mt-1 text-xl font-black">Mi carrito ({count})</h2></div><button onClick={() => setCartOpen(false)} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100"><X size={18}/></button></div>
        {cart.length === 0 ? <div className="grid flex-1 place-items-center px-8 text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff5bd]"><ShoppingBag size={27}/></div><h3 className="mt-5 text-lg font-black">Tu carrito está vacío</h3><p className="mt-2 text-sm text-neutral-500">Explora el catálogo y agrega los productos que necesitas.</p><button onClick={() => setCartOpen(false)} className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Seguir comprando</button></div></div> : <>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">{cart.map((line) => <div key={line.product.id} className="flex gap-3 border-b border-neutral-100 pb-4"><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f4f1e5]">{line.product.image_url ? <img src={line.product.image_url} alt="" className="h-full w-full object-cover"/> : <ShoppingBasket className="text-neutral-300"/>}</div><div className="min-w-0 flex-1"><div className="font-bold">{line.product.name}</div><div className="mt-1 text-sm text-neutral-500">{money(line.product.price)} c/u</div><div className="mt-3 flex items-center gap-3"><button onClick={() => changeQuantity(line.product.id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-neutral-200"><Minus size={13}/></button><span className="text-sm font-bold">{line.quantity}</span><button onClick={() => changeQuantity(line.product.id, 1)} className="grid h-7 w-7 place-items-center rounded-full border border-neutral-200"><Plus size={13}/></button><button onClick={() => remove(line.product.id)} className="ml-auto text-neutral-400 hover:text-red-600" aria-label="Eliminar"><Trash2 size={16}/></button></div></div><div className="text-sm font-black">{money(line.product.price * line.quantity)}</div></div>)}</div>
          <div className="border-t border-neutral-100 p-6"><div className="flex justify-between text-sm text-neutral-500"><span>Subtotal</span><span>{money(total)}</span></div><div className="mt-2 flex justify-between text-lg font-black"><span>Total</span><span>{money(total)}</span></div><p className="mt-3 text-xs leading-5 text-neutral-400">El envío y la confirmación del pedido se calcularán en el siguiente paso.</p><button disabled className="mt-5 w-full rounded-full bg-[#f5c900] px-6 py-4 text-sm font-black text-black opacity-60">Continuar al pago · Próximamente</button></div>
        </>}
      </aside></div>}
    </main>
  );
}
