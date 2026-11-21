import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Pencil, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { saveProduct, deleteProduct } from './actions';

type Product = { id:string; name:string; description:string|null; price:number; image_url:string|null; category_id:string|null; is_active:boolean; is_featured:boolean };
type Category = { id:string; name:string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ edit?:string; saved?:string; deleted?:string; error?:string }> }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/login?error=config');
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (!profile || !['owner','admin'].includes(profile.role)) redirect('/admin');
  const params = await searchParams;
  const [{data: products},{data: categories}] = await Promise.all([
    supabase.from('products').select('id,name,description,price,image_url,category_id,is_active,is_featured').order('created_at',{ascending:false}),
    supabase.from('categories').select('id,name').order('sort_order'),
  ]);
  const rows = (products ?? []) as Product[];
  const cats = (categories ?? []) as Category[];
  const editing = rows.find(p => p.id === params.edit);
  return <main className="min-h-screen bg-[#f6f6f3] px-4 py-7 text-neutral-900 sm:px-8"><div className="mx-auto max-w-6xl">
    <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500"><ArrowLeft size={15}/> Panel</Link>
    <div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-neutral-400">PAPAMERICANA / CATÁLOGO</p><h1 className="mt-1 text-3xl font-black">Productos y menú</h1><p className="mt-1 text-sm text-neutral-500">Edita nombres, ingredientes, precios, imágenes y disponibilidad.</p></div><a href="#form-producto" className="inline-flex items-center gap-2 rounded-xl bg-[#ffd21c] px-4 py-3 text-xs font-black"><Plus size={16}/> Nuevo producto</a></div>
    {params.saved && <p className="mt-5 rounded-xl bg-green-50 p-3 text-xs font-bold text-green-700">Producto guardado correctamente.</p>}
    {params.deleted && <p className="mt-5 rounded-xl bg-green-50 p-3 text-xs font-bold text-green-700">Producto desactivado.</p>}
    {params.error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">No se pudo guardar. Revisa los datos e inténtalo nuevamente.</p>}
    <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map(p=><article key={p.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex gap-3 p-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#fff4bf]">{p.image_url?<img src={p.image_url} alt={p.name} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-2xl">🍟</div>}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate text-sm font-black">{p.name}</h2>{p.is_featured&&<span className="rounded bg-[#fff4bf] px-1.5 py-1 text-[8px] font-black">DESTACADO</span>}</div><p className="mt-1 line-clamp-2 text-[10px] text-neutral-500">{p.description||'Sin descripción'}</p><p className="mt-2 text-lg font-black">${Number(p.price).toFixed(2)}</p></div></div>
      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3"><span className={'inline-flex items-center gap-1 text-[10px] font-bold '+(p.is_active?'text-green-700':'text-neutral-400')}>{p.is_active?<Eye size={13}/>:<EyeOff size={13}/>} {p.is_active?'Visible en tienda':'Oculto'}</span><div className="flex gap-2"><Link href={'/admin/products?edit='+p.id+'#form-producto'} className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-[10px] font-bold"><Pencil size={12}/> Editar</Link><form action={deleteProduct}><input type="hidden" name="id" value={p.id}/><button className="rounded-lg border border-neutral-200 px-3 py-2 text-[10px] font-bold">Ocultar</button></form></div></div>
    </article>)}</section>
    <section id="form-producto" className="mt-8 scroll-mt-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7"><h2 className="text-lg font-black">{editing?'Editar producto':'Crear producto'}</h2>
      <form action={saveProduct} className="mt-5 grid gap-4 md:grid-cols-2"><input type="hidden" name="id" value={editing?.id??''}/>
        <label className="text-xs font-bold">Nombre<input name="name" required defaultValue={editing?.name??''} className="field-input"/></label>
        <label className="text-xs font-bold">Precio (USD)<input name="price" type="number" min="0" step="0.01" required defaultValue={editing?.price??''} className="field-input"/></label>
        <label className="text-xs font-bold">Categoría<select name="category_id" defaultValue={editing?.category_id??''} className="field-input"><option value="">Sin categoría</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="text-xs font-bold">URL de fotografía<input name="image_url" type="url" defaultValue={editing?.image_url??''} placeholder="https://..." className="field-input"/></label>
        <label className="text-xs font-bold md:col-span-2">Descripción / ingredientes<textarea name="description" rows={3} defaultValue={editing?.description??''} className="field-input"/></label>
        <label className="flex items-center gap-2 text-xs font-bold"><input name="is_active" type="checkbox" defaultChecked={editing?.is_active??true}/> Visible en la tienda</label>
        <label className="flex items-center gap-2 text-xs font-bold"><input name="is_featured" type="checkbox" defaultChecked={editing?.is_featured??false}/> Marcar como destacado</label>
        <div className="flex flex-wrap gap-2 md:col-span-2"><button className="rounded-xl bg-[#ffd21c] px-5 py-3 text-xs font-black">Guardar producto</button>{editing&&<Link href="/admin/products#form-producto" className="rounded-xl border border-neutral-200 px-5 py-3 text-xs font-bold">Cancelar edición</Link>}</div>
      </form></section>
  </div><style>{`.field-input{display:block;width:100%;margin-top:7px;border:1px solid #e5e5e5;border-radius:10px;padding:11px 12px;font-size:13px;font-weight:500;outline:none}.field-input:focus{border-color:#171717}`}</style></main>;
}
