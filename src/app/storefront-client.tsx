'use client';

import { useMemo, useState } from 'react';
import {
  Search, ShoppingBag, Menu, X, Plus, Minus, Trash2, ArrowRight,
  ChevronRight, Sparkles, Utensils, Sandwich, Flame, CupSoda,
  SlidersHorizontal, Bike, Store, Clock3, BadgePercent,
} from 'lucide-react';

export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  tag: string;
  image_url: string | null;
  description?: string | null;
};

type Props = { categories: string[]; products: StoreProduct[]; hasLiveProducts: boolean };
type CartLine = { product: StoreProduct; quantity: number };

const money = (value: number) => '$' + Number(value || 0).toFixed(2);
const iconForCategory = (name: string) => {
  const value = name.toLowerCase();
  if (value.includes('hamb')) return Sandwich;
  if (value.includes('salchi') || value.includes('papas')) return Flame;
  if (value.includes('hot')) return Utensils;
  if (value.includes('bebida')) return CupSoda;
  if (value.includes('combo')) return BadgePercent;
  return Utensils;
};

export default function StorefrontClient({ categories, products, hasLiveProducts }: Props) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [sort, setSort] = useState('featured');

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const categoryMatch = activeCategory === 'Todos' || p.category === activeCategory;
      const searchText = (p.name + ' ' + (p.description ?? '')).toLowerCase();
      const searchMatch = searchText.includes(query.trim().toLowerCase());
      return categoryMatch && searchMatch;
    });
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, activeCategory, query, sort]);

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
    setCart((current) => current.map((line) => line.product.id === id ? { ...line, quantity: line.quantity + amount } : line).filter((line) => line.quantity > 0));
  }
  function remove(id: string) { setCart((current) => current.filter((line) => line.product.id !== id)); }

  const featured = products.filter((p) => p.tag === 'DESTACADO' || p.tag === 'POPULAR').slice(0, 4);
  const visibleFeatured = featured.length ? featured : products.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#171717]">
      <div className="bg-[#171717] px-4 py-2 text-center text-[10px] font-extrabold uppercase tracking-[.16em] text-white sm:text-[11px]">PAPAMERICANA · comida rápida hecha para disfrutar</div>

      <header className="sticky top-0 z-40 border-b border-black/[.06] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1380px] items-center gap-4 px-4 py-3 sm:px-7 lg:px-10">
          <a href="#" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ffd21c] text-xl font-black text-black">P</span>
            <span className="text-[17px] font-black leading-none tracking-[-.055em] sm:text-[19px]">PAPAMERICANA<span className="mt-1 block text-[8px] font-extrabold uppercase tracking-[.2em] text-neutral-500">Comida rápida</span></span>
          </a>
          <nav className="ml-5 hidden items-center gap-6 text-[12px] font-extrabold text-neutral-600 lg:flex">
            <a href="#catalogo" className="transition hover:text-black">Inicio</a>
            <a href="#categorias" className="transition hover:text-black">Menú</a>
            <a href="#combos" className="transition hover:text-black">Combos</a>
          </nav>
          <div className="ml-auto hidden max-w-[430px] flex-1 items-center rounded-full border border-neutral-200 bg-[#faf9f4] px-4 py-2.5 md:flex">
            <Search size={16} className="shrink-0 text-neutral-400"/>
            <input value={query} onChange={(e) => { setQuery(e.target.value); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} placeholder="Buscar en el menú..." className="ml-2 w-full bg-transparent text-xs font-medium outline-none placeholder:text-neutral-400"/>
            {query && <button onClick={() => setQuery('')} className="text-[10px] font-bold text-neutral-400">BORRAR</button>}
          </div>
          <button onClick={() => setCartOpen(true)} className="ml-auto flex h-10 items-center gap-2 rounded-full bg-[#171717] px-4 text-xs font-extrabold text-white transition hover:bg-[#333] md:ml-0">
            <ShoppingBag size={16}/><span className="hidden sm:inline">Mi pedido</span><span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#ffd21c] px-1 text-[10px] font-black text-black">{count}</span>
          </button>
          <button onClick={() => setMobileOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 lg:hidden" aria-label="Abrir menú">{mobileOpen ? <X size={18}/> : <Menu size={18}/>}</button>
        </div>
        {mobileOpen && <div className="border-t border-neutral-100 bg-white px-5 py-4 lg:hidden"><div className="mb-3 flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2.5"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en el menú..." className="w-full bg-transparent text-sm outline-none"/></div><div className="grid grid-cols-3 gap-2 text-center text-xs font-bold"><a onClick={() => setMobileOpen(false)} href="#catalogo" className="rounded-lg bg-neutral-100 p-3">Inicio</a><a onClick={() => setMobileOpen(false)} href="#categorias" className="rounded-lg bg-neutral-100 p-3">Menú</a><a onClick={() => setMobileOpen(false)} href="#combos" className="rounded-lg bg-neutral-100 p-3">Combos</a></div></div>}
      </header>

      <div className="mx-auto max-w-[1380px] px-4 pb-16 pt-5 sm:px-7 lg:px-10 lg:pt-7">
        <section className="relative isolate min-h-[330px] overflow-hidden rounded-[24px] bg-[#ffd21c] sm:min-h-[370px] lg:min-h-[410px]">
          <div className="absolute -right-20 -top-32 h-[450px] w-[450px] rounded-full border-[55px] border-white/25"/>
          <div className="absolute -bottom-28 right-[22%] h-[280px] w-[280px] rounded-full bg-[#f0b900]/50 blur-2xl"/>
          <div className="relative z-10 flex min-h-[330px] flex-col justify-center px-6 py-9 sm:min-h-[370px] sm:px-10 lg:min-h-[410px] lg:w-[52%] lg:px-14">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-black px-3.5 py-2 text-[9px] font-black uppercase tracking-[.17em] text-white"><Sparkles size={12}/> ¡Antojo resuelto!</span>
            <h1 className="max-w-[560px] text-[clamp(3rem,7vw,6.4rem)] font-black leading-[.82] tracking-[-.075em] text-black">Sabor que<br/><span className="text-white">se disfruta.</span></h1>
            <p className="mt-5 max-w-[330px] text-sm font-semibold leading-5 text-black/75">Salchipapas, hamburguesas, hot dogs y mucho más, preparados para alegrarte el día.</p>
            <a href="#catalogo" className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-black px-6 py-3.5 text-xs font-black text-white transition hover:translate-y-[-2px] hover:bg-neutral-800">Ver menú <ArrowRight size={16}/></a>
          </div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-[56%] lg:block">
            <div className="absolute right-[7%] top-[10%] h-[310px] w-[310px] rounded-full border-[34px] border-white/30 bg-[#f5bd00]/40"/>
            <div className="absolute right-[20%] top-[14%] grid h-[280px] w-[360px] rotate-[-4deg] place-items-center rounded-[42px] border border-white/70 bg-white/25 shadow-[0_24px_50px_rgba(0,0,0,.09)]">
              <div className="grid h-[215px] w-[290px] place-items-center rounded-[30px] bg-white shadow-xl"><Utensils size={116} strokeWidth={1.3} className="text-[#171717]"/><span className="text-[12px] font-black uppercase tracking-[.3em]">PAPAMERICANA</span></div>
            </div>
            <div className="absolute right-[65%] top-[20%] grid h-[76px] w-[76px] rotate-[-10deg] place-items-center rounded-2xl bg-white shadow-xl"><Sandwich size={34}/></div>
            <div className="absolute right-[4%] top-[56%] grid h-[82px] w-[82px] rotate-[9deg] place-items-center rounded-2xl bg-black text-[#ffd21c] shadow-xl"><Flame size={36}/></div>
            <div className="absolute bottom-[7%] right-[42%] grid h-[72px] w-[72px] rotate-[8deg] place-items-center rounded-2xl bg-white shadow-xl"><CupSoda size={34}/></div>
          </div>
        </section>

        <section id="categorias" className="scroll-mt-28 pt-9">
          <div className="mb-4 flex items-end justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-neutral-400">Algo rico te espera</p><h2 className="mt-1 text-xl font-black tracking-[-.04em] sm:text-2xl">Explora nuestro menú</h2></div><button onClick={() => { setActiveCategory('Todos'); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[11px] font-extrabold text-neutral-500 hover:text-black">Ver todo <ArrowRight size={13} className="ml-1 inline"/></button></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.filter((c) => c !== 'Todos').map((category) => {
              const Icon = iconForCategory(category);
              const active = activeCategory === category;
              return <button key={category} onClick={() => { setActiveCategory(active ? 'Todos' : category); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} className={'group flex min-h-[82px] items-center gap-3 rounded-2xl border px-3 py-3 text-left transition sm:min-h-[94px] ' + (active ? 'border-black bg-[#ffd21c]' : 'border-black/[.06] bg-white hover:border-[#e8bd00] hover:bg-[#fff9df]')}>
                <span className={'grid h-11 w-11 shrink-0 place-items-center rounded-xl ' + (active ? 'bg-black text-[#ffd21c]' : 'bg-[#fff4bf] text-black')}><Icon size={22}/></span>
                <span className="min-w-0"><span className="block text-xs font-black leading-tight sm:text-sm">{category}</span><span className="mt-1 block text-[9px] font-semibold text-neutral-400">Ver opciones <ChevronRight size={11} className="inline"/></span></span>
              </button>;
            })}
          </div>
        </section>

        <section id="destacados" className="scroll-mt-28 pt-10">
          <div className="mb-4 flex items-end justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-neutral-400">Los favoritos</p><h2 className="mt-1 text-xl font-black tracking-[-.04em] sm:text-2xl">Los más pedidos</h2></div><button onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })} className="text-[11px] font-extrabold text-neutral-500 hover:text-black">Ver menú completo <ArrowRight size={13} className="ml-1 inline"/></button></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {visibleFeatured.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={add}/>)}
          </div>
          {visibleFeatured.length === 0 && <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-10 text-center text-sm text-neutral-400">Estamos preparando nuestro menú. Muy pronto verás aquí los favoritos.</div>}
        </section>

        <section id="combos" className="mt-9 overflow-hidden rounded-[22px] bg-[#171717] text-white">
          <div className="relative flex flex-col justify-between gap-5 px-6 py-7 sm:flex-row sm:items-center sm:px-9 sm:py-8">
            <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full border-[35px] border-[#ffd21c]/15"/>
            <div className="relative z-10"><span className="text-[9px] font-black uppercase tracking-[.22em] text-[#ffd21c]">Para esos antojos grandes</span><h2 className="mt-2 text-3xl font-black uppercase leading-[.9] tracking-[-.05em] sm:text-4xl">Combos<br/><span className="text-[#ffd21c]">PAPAMERICANA</span></h2><p className="mt-3 text-xs font-semibold text-white/60">Tu comida favorita, lista para disfrutar.</p></div>
            <button onClick={() => { setActiveCategory('Combos'); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }} className="relative z-10 flex w-fit items-center gap-3 rounded-full bg-[#ffd21c] px-6 py-3.5 text-xs font-black text-black transition hover:bg-white">Ver combos <ArrowRight size={15}/></button>
          </div>
        </section>

        <section id="catalogo" className="scroll-mt-28 pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-[9px] font-black uppercase tracking-[.2em] text-neutral-400">Elige tu antojo</p><h2 className="mt-1 text-2xl font-black tracking-[-.045em] sm:text-3xl">Nuestro menú</h2><p className="mt-1 text-xs text-neutral-500">{filtered.length} opciones disponibles</p></div>
            <div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2.5 md:hidden"><Search size={14}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="w-28 bg-transparent text-xs outline-none"/></div><label className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2.5 text-[10px] font-bold text-neutral-600"><SlidersHorizontal size={14}/><select value={sort} onChange={(e) => setSort(e.target.value)} className="max-w-[110px] bg-transparent outline-none"><option value="featured">Ordenar</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="name">Nombre</option></select></label></div>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={'shrink-0 rounded-full px-4 py-2.5 text-[10px] font-extrabold transition ' + (activeCategory === category ? 'bg-black text-white' : 'border border-neutral-200 bg-white text-neutral-600 hover:border-black')}>{category}</button>)}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={add}/>)}
          </div>
          {filtered.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 bg-white py-14 text-center"><Utensils size={30} className="mx-auto text-neutral-300"/><p className="mt-3 font-bold">Todavía no hay productos en el menú</p><p className="mt-1 text-xs text-neutral-500">El administrador podrá cargar salchipapas, hamburguesas, hot dogs y combos.</p><button onClick={() => { setQuery(''); setActiveCategory('Todos'); }} className="mt-4 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white">Limpiar filtros</button></div>}
          {!hasLiveProducts && <p className="mt-4 text-[10px] text-neutral-400">El menú se actualizará con los productos que cargue el administrador.</p>}
        </section>
      </div>

      <section className="border-t border-black/[.06] bg-white px-5 py-7">
        <div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-5 sm:grid-cols-4">
          {[{icon:Bike,title:'Delivery',desc:'Tu pedido hasta tu puerta.'},{icon:Store,title:'Retiro en local',desc:'Pide y retira en el local.'},{icon:Clock3,title:'Preparación rápida',desc:'Preparamos tu pedido al momento.'},{icon:BadgePercent,title:'Promociones',desc:'Descubre combos y ofertas.'}].map((item) => <div key={item.title} className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff4bf]"><item.icon size={21}/></span><span><b className="block text-xs font-black">{item.title}</b><span className="mt-1 block text-[10px] text-neutral-500">{item.desc}</span></span></div>)}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#171717] px-5 py-6 text-white"><div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-3 text-[10px] text-neutral-400"><span className="font-black tracking-wider text-white">PAPAMERICANA · COMIDA RÁPIDA</span><span>© {new Date().getFullYear()} PAPAMERICANA</span><a href="https://adsgencydigital.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-[#ffd21c] transition hover:text-white">Creado por Adsgency Digital ↗</a></div></footer>

      {cartOpen && <div className="fixed inset-0 z-50"><button aria-label="Cerrar pedido" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"/><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5"><div><div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Tu antojo</div><h2 className="mt-1 text-xl font-black">Mi pedido ({count})</h2></div><button onClick={() => setCartOpen(false)} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100"><X size={18}/></button></div>
        {cart.length === 0 ? <div className="grid flex-1 place-items-center px-8 text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff4bf]"><ShoppingBag size={27}/></div><h3 className="mt-5 text-lg font-black">Aún no agregas nada</h3><p className="mt-2 text-sm text-neutral-500">Elige algo rico del menú para empezar.</p><button onClick={() => setCartOpen(false)} className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Volver al menú</button></div></div> : <>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">{cart.map((line) => <div key={line.product.id} className="flex gap-3 border-b border-neutral-100 pb-4"><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#fff4bf]">{line.product.image_url ? <img src={line.product.image_url} alt={line.product.name} className="h-full w-full object-cover"/> : <Utensils className="text-neutral-300"/>}</div><div className="min-w-0 flex-1"><div className="text-sm font-bold">{line.product.name}</div><div className="mt-1 text-xs text-neutral-500">{money(line.product.price)} c/u</div><div className="mt-3 flex items-center gap-3"><button onClick={() => changeQuantity(line.product.id, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-neutral-200"><Minus size={13}/></button><span className="text-sm font-bold">{line.quantity}</span><button onClick={() => changeQuantity(line.product.id, 1)} className="grid h-7 w-7 place-items-center rounded-full border border-neutral-200"><Plus size={13}/></button><button onClick={() => remove(line.product.id)} className="ml-auto text-neutral-400 hover:text-red-600" aria-label="Eliminar"><Trash2 size={16}/></button></div></div><div className="text-sm font-black">{money(line.product.price * line.quantity)}</div></div>)}</div>
          <div className="border-t border-neutral-100 p-6"><div className="flex justify-between text-xs text-neutral-500"><span>Subtotal</span><span>{money(total)}</span></div><div className="mt-2 flex justify-between text-lg font-black"><span>Total</span><span>{money(total)}</span></div><p className="mt-3 text-[10px] leading-5 text-neutral-400">Los datos de entrega y pago se solicitarán al confirmar el pedido.</p><button disabled className="mt-5 w-full rounded-full bg-[#ffd21c] px-6 py-4 text-sm font-black text-black opacity-60">Confirmar pedido · En configuración</button></div>
        </>}
      </aside></div>}
    </main>
  );
}

function ProductCard({ product, index, onAdd }: { product: StoreProduct; index: number; onAdd: (product: StoreProduct) => void }) {
  const backgrounds = ['bg-[#fff3bd]', 'bg-[#f2f1eb]', 'bg-[#f8e9dd]', 'bg-[#eaf0e4]'];
  return <article className="group min-w-0 overflow-hidden rounded-[17px] border border-black/[.055] bg-white p-2.5 transition duration-300 hover:-translate-y-1 hover:border-black/10 hover:shadow-[0_12px_30px_rgba(0,0,0,.07)] sm:rounded-[20px] sm:p-3">
    <div className={'relative grid aspect-[1.18/1] place-items-center overflow-hidden rounded-[13px] ' + backgrounds[index % backgrounds.length]}>
      {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <Utensils size={42} className="text-black/15"/>}
      {product.tag && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-black">{product.tag}</span>}
    </div>
    <div className="px-1 pb-1 pt-3"><p className="truncate text-[9px] font-bold uppercase tracking-wider text-neutral-400">{product.category}</p><h3 className="mt-1 line-clamp-2 min-h-9 text-[11px] font-extrabold leading-[1.3] text-black sm:text-xs">{product.name}</h3>{product.description && <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-neutral-500">{product.description}</p>}<div className="mt-2.5 flex items-center justify-between gap-1"><span className="text-xs font-black text-black sm:text-sm">{product.price > 0 ? money(product.price) : 'Consultar'}</span><button onClick={() => onAdd(product)} disabled={product.price <= 0} aria-label={'Añadir ' + product.name} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ffd21c] text-black transition hover:bg-black hover:text-[#ffd21c] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={17}/></button></div></div>
  </article>;
}
