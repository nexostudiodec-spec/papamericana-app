'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) redirect('/login?error=missing');
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/login?error=config');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/login?error=invalid');

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) {
    await supabase.auth.signOut();
    redirect('/login?error=unauthorized');
  }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (!profile || !['owner', 'admin', 'staff'].includes(profile.role)) {
    await supabase.auth.signOut();
    redirect('/login?error=unauthorized');
  }
  redirect('/admin');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect('/login');
}
