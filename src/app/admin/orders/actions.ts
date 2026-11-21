'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createSupabaseServerClient} from '@/lib/supabase/server';
const allowed=['pending','confirmed','preparing','ready','out_for_delivery','completed','cancelled'];
export async function updateOrderStatus(f:FormData){const s=await createSupabaseServerClient();if(!s)redirect('/login?error=config');const {data}=await s.auth.getClaims();const uid=data?.claims?.sub;if(!uid)redirect('/login');const {data:p}=await s.from('profiles').select('role').eq('id',uid).maybeSingle();if(!p||!['owner','admin'].includes(p.role))redirect('/admin');const id=String(f.get('id')??'');const status=String(f.get('status')??'');if(!id||!allowed.includes(status))redirect('/admin/orders');const {error}=await s.from('orders').update({status}).eq('id',id);if(error)redirect('/admin/orders?error=update');revalidatePath('/admin');revalidatePath('/admin/orders');redirect('/admin/orders?saved=1');}
