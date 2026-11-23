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

  const note = String(formData.get('note') ?? '').trim().slice(0, 160);
  const { error } = await supabase.rpc('register_in_store_loyalty_stamp', {
    p_token: token,
    p_note: note || 'Compra presencial',
  });
  if (error) redirect('/admin/loyalty/scan?error=save');

  revalidatePath('/admin/loyalty/scan');
  redirect('/admin/loyalty/scan?saved=1');
}
