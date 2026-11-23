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
const field = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function saveProduct(form: FormData) {
  const supabase = await requireAdmin();
  const id = field(form, 'id');
  const name = field(form, 'name');
  const price = Number(field(form, 'price'));
  if (!name || !Number.isFinite(price) || price < 0) redirect('/admin/products?error=validation');
  const image = form.get('image_file');
  let imageUrl = field(form, 'existing_image_url') || null;
  if (image instanceof File && image.size > 0) {
    if (!['image/jpeg','image/png','image/webp'].includes(image.type) || image.size > 5 * 1024 * 1024) redirect('/admin/products?error=image');
    const ext = image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, image, { contentType: image.type, upsert: false });
    if (uploadError) redirect('/admin/products?error=upload');
    imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }
  const payload = {
    name,
    ...(id ? {} : { slug: slugify(name) + '-' + crypto.randomUUID().slice(0, 6) }),
    category_id: field(form, 'category_id') || null,
    description: field(form, 'description') || null,
    price,
    image_url: imageUrl,
    is_featured: form.get('is_featured') === 'on',
    is_active: form.get('is_active') === 'on',
    stock_mode: 'untracked',
  };
  const result = id ? await supabase.from('products').update(payload).eq('id', id) : await supabase.from('products').insert(payload);
  if (result.error) redirect('/admin/products?error=save');
  revalidatePath('/');
  revalidatePath('/admin/products');
  redirect('/admin/products?saved=1');
}

export async function deleteProduct(form: FormData) {
  const supabase = await requireAdmin();
  const id = field(form, 'id');
  if (!id) redirect('/admin/products');
  const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id);
  if (error) redirect('/admin/products?error=delete');
  revalidatePath('/');
  revalidatePath('/admin/products');
  redirect('/admin/products?deleted=1');
}
