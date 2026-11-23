'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/login?error=config');
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', id).maybeSingle();
  if (!profile || !['owner', 'admin'].includes(profile.role)) redirect('/admin');
  return supabase;
}
const slugify = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function saveCategory(form: FormData) {
  const supabase = await requireAdmin();
  const id = String(form.get('id') ?? '');
  const name = String(form.get('name') ?? '').trim();
  if (!name) redirect('/admin/categories?error=validation');
  const iconFile = form.get('icon_file');
  let iconUrl = String(form.get('existing_icon_url') ?? '').trim() || null;
  if (iconFile instanceof File && iconFile.size > 0) {
    if (!['image/jpeg','image/png','image/webp'].includes(iconFile.type) || iconFile.size > 2 * 1024 * 1024) redirect('/admin/categories?error=icon');
    const ext = iconFile.type === 'image/png' ? 'png' : iconFile.type === 'image/webp' ? 'webp' : 'jpg';
    const path = 'categories/' + crypto.randomUUID() + '.' + ext;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, iconFile, { contentType: iconFile.type, upsert: false });
    if (uploadError) redirect('/admin/categories?error=upload');
    iconUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }
  const payload = {
    name,
    slug: slugify(name),
    description: String(form.get('description') ?? '').trim() || null,
    sort_order: Number(form.get('sort_order') ?? 0),
    is_active: form.get('is_active') === 'on',
    icon_name: String(form.get('icon_name') ?? 'tag').trim() || 'tag',
    icon_url: iconUrl,
  };
  const { error } = id
    ? await supabase.from('categories').update(payload).eq('id', id)
    : await supabase.from('categories').insert(payload);
  if (error) redirect('/admin/categories?error=save');
  revalidatePath('/');
  revalidatePath('/admin/categories');
  redirect('/admin/categories?saved=1');
}

export async function toggleCategory(form: FormData) {
  const supabase = await requireAdmin();
  const id = String(form.get('id') ?? '');
  const active = String(form.get('active') ?? '') === 'true';
  const { error } = await supabase.from('categories').update({ is_active: active }).eq('id', id);
  if (error) redirect('/admin/categories?error=save');
  revalidatePath('/');
  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}


export async function deleteCategory(form: FormData) {
  const supabase = await requireAdmin();
  const id = String(form.get('id') ?? '');
  if (!id) redirect('/admin/categories?error=delete');
  const { count, error: countError } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id);
  if (countError) redirect('/admin/categories?error=delete');
  if ((count ?? 0) > 0) redirect('/admin/categories?error=hasproducts');
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) redirect('/admin/categories?error=delete');
  revalidatePath('/');
  revalidatePath('/admin/categories');
  redirect('/admin/categories?deleted=1');
}
