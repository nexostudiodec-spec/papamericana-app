import Link from 'next/link';
import { ArrowLeft, Tags } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { saveCategory, toggleCategory } from './actions';

type Category = { id:string; name:string; slug:string; description:string|null; sort_order:number; is_active:boolean };

export default async function CategoriesPage({ searchParams }: { searchParams:Promise<{edit?:string;saved?:string;error?:string}> }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const params = await searchParams;
  const { data } = await supabase.from('categories').select('id,name,slug,description,sort_order,is_active').order('sort_order');
  const categories = (data ?? []) as Category[];
  const editing = categories.find(c => c.id === params.edit);
  return <main className="min-h-screen bg-[#f6f6f3] px-4 py-8 text-neutral-900 sm:px-8"><div className="mx-auto max-w-5xl">
    <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500"><ArrowLeft size={15}/> Panel</Link>
    <h1 className="mt-6 text-3xl font-black">Categorías</h1><p className="mt-1 text-sm text-neutral-500">Organiza las secciones del menú que aparecen en la tienda.</p>
    {params.saved && <p className="mt-4 rounded-xl bg-green-50 p-3 text-xs font-bold text-green-700">Categoría guardada.</p>}
    {params.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">No se pudo guardar. Comprueba que el nombre no esté repetido.</p>}
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{categories.map(c=><article key={c.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff4bf]"><Tags size={20}/></span><div className="min-w-0 flex-1"><h2 className="font-black">{c.name}</h2><p className="text-xs text-neutral-400">{c.description || c.slug} · Orden {c.sort_order}</p></div><span className={'rounded-full px-2 py-1 text-[9px] font-black '+(c.is_active?'bg-green-50 text-green-700':'bg-neutral-100 text-neutral-500')}>{c.is_active?'ACTIVA':'OCULTA'}</span><Link href={'/admin/categories?edit='+c.id} className="text-xs font-bold underline">Editar</Link><form action={toggleCategory}><input type="hidden" name="id" value={c.id}/><input type="hidden" name="active" value={String(!c.is_active)}/><button className="text-[10px] font-bold">{c.is_active?'Ocultar':'Activar'}</button></form></article>)}</div>
    <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7"><h2 className="text-lg font-black">{editing?'Editar categoría':'Nueva categoría'}</h2>
      <form action={saveCategory} className="mt-4 grid gap-4 sm:grid-cols-2"><input type="hidden" name="id" value={editing?.id??''}/>
        <label className="text-xs font-bold">Nombre<input name="name" required defaultValue={editing?.name??''} className="field-input"/></label>
        <label className="text-xs font-bold">Orden<input name="sort_order" type="number" defaultValue={editing?.sort_order??categories.length+1} className="field-input"/></label>
        <label className="text-xs font-bold sm:col-span-2">Descripción<input name="description" defaultValue={editing?.description??''} className="field-input"/></label>
        <label className="flex items-center gap-2 text-xs font-bold"><input name="is_active" type="checkbox" defaultChecked={editing?.is_active??true}/> Categoría activa</label>
        <div className="flex gap-2"><button className="rounded-xl bg-[#ffd21c] px-5 py-3 text-xs font-black">Guardar</button>{editing&&<Link href="/admin/categories" className="rounded-xl border px-5 py-3 text-xs font-bold">Cancelar</Link>}</div>
      </form>
    </section>
  </div><style>{`.field-input{display:block;width:100%;margin-top:7px;border:1px solid #e5e5e5;border-radius:10px;padding:11px 12px;font-size:13px;outline:none}`}</style></main>;
}
