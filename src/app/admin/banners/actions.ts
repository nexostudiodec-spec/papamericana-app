'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function adminClient() {
 const s=await createSupabaseServerClient();
 if(!s) redirect('/login?error=config');
 const {data}=await s.auth.getClaims();
 const uid=data?.claims?.sub;
 if(!uid) redirect('/login');
 const {data:p}=await s.from('profiles').select('role').eq('id',uid).maybeSingle();
 if(!p||!['owner','admin'].includes(p.role)) redirect('/admin');
 return s;
}
export async function saveBanner(f:FormData) {
 const s=await adminClient();
 const id=String(f.get('id')??'').trim();
 const title=String(f.get('title')??'').trim();
 const subtitle=String(f.get('subtitle')??'').trim();
 const button_text=String(f.get('button_text')??'').trim();
 const button_url=String(f.get('button_url')??'').trim();
 const sort_order=Math.max(1,Math.min(20,Number(f.get('sort_order')||1)));
 const is_active=f.get('is_active')==='on';
 if(!title) redirect('/admin/banners?error=validation');
 let image_url=String(f.get('existing_image_url')??'').trim()||null;
 const file=f.get('image_file');
 if(file instanceof File&&file.size>0) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024) redirect('/admin/banners?error=image');
  const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
  const path='banners/'+crypto.randomUUID()+'.'+ext;
  const {error}=await s.storage.from('product-images').upload(path,file,{contentType:file.type,upsert:false});
  if(error) redirect('/admin/banners?error=upload');
  image_url=s.storage.from('product-images').getPublicUrl(path).data.publicUrl;
 }
 const payload={title,subtitle:subtitle||null,button_text:button_text||null,button_url:button_url||null,image_url,sort_order,is_active,updated_at:new Date().toISOString()};
 const result=id?await s.from('store_banners').update(payload).eq('id',id):await s.from('store_banners').insert(payload);
 if(result.error) redirect('/admin/banners?error=save');
 revalidatePath('/');revalidatePath('/admin/banners');redirect('/admin/banners?saved=1');
}
export async function deleteBanner(f:FormData) {
 const s=await adminClient(); const id=String(f.get('id')??'');
 if(id) await s.from('store_banners').delete().eq('id',id);
 revalidatePath('/');revalidatePath('/admin/banners');redirect('/admin/banners?deleted=1');
}
