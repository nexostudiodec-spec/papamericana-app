'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function sendCustomerAccess(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect('/mi-cuenta?error=email');
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/mi-cuenta?error=config');

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://papamericana-app.vercel.app';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?next=/mi-cuenta`,
    },
  });

  if (error) redirect('/mi-cuenta?error=send');
  redirect('/mi-cuenta?sent=1');
}
