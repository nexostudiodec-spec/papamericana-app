'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function registerInStoreStamp(formData: FormData) {
  const token = String(formData.get('token') ?? '').trim();
  if (!token) redirect('/admin/loyalty/scan?error=token');

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/login?error=config');
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (!profile || !['owner','admin','staff'].includes(profile.role)) redirect('/login?error=unauthorized');

  const { data: customer } = await supabase.from('customers')
    .select('id').eq('loyalty_qr_token', token).maybeSingle();
  if (!customer) redirect('/admin/loyalty/scan?error=notfound');

  const note = String(formData.get('note') ?? '').trim().slice(0, 160);
  const { error: eventError } = await supabase.from('loyalty_stamp_events').insert({
    customer_id: customer.id, stamps: 1, source: 'in_store', note: note || 'Compra presencial', created_by: userId,
  });
  if (eventError) redirect('/admin/loyalty/scan?error=save');

  const { error } = await supabase.from('customers')
    .update({ loyalty_stamps: (await supabase.from('customers').select('loyalty_stamps').eq('id', customer.id).single()).data?.loyalty_stamps + 1 })
    .eq('id', customer.id);
  if (error) redirect('/admin/loyalty/scan?error=save');

  revalidatePath('/admin/loyalty/scan');
  redirect('/admin/loyalty/scan?saved=1');
}
