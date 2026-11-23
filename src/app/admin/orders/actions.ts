'use server';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const allowed=['pending','confirmed','preparing','ready','out_for_delivery','completed','cancelled'];
type UpdateOrderStatusResult = { ok: boolean; error?: string };
export async function updateOrderStatus(formData:FormData): Promise<UpdateOrderStatusResult> {
 const s=await createSupabaseServerClient();
 if(!s)return {ok:false,error:'config'};
 const {data}=await s.auth.getClaims();
 const uid=data?.claims?.sub as string|undefined;
 if(!uid)return {ok:false,error:'unauthorized'};
 const {data:p}=await s.from('profiles').select('role').eq('id',uid).maybeSingle();
 if(!p||!['owner','admin','staff'].includes(p.role))return {ok:false,error:'unauthorized'};
 const id=String(formData.get('id')??'');
 const status=String(formData.get('status')??'');
 if(!id||!allowed.includes(status))return {ok:false,error:'invalid'};
 const {error}=await s.from('orders').update({status}).eq('id',id);
 if(error)return {ok:false,error:'update'};
 revalidatePath('/admin');revalidatePath('/admin/orders');
 return {ok:true};
}
