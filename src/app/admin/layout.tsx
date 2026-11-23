import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Temporary access is intentionally limited to Vercel Preview deployments.
  // Production keeps the normal authenticated admin gate.
  if (process.env.VERCEL_ENV === 'preview') return <>{children}</>;

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/login?error=config');
  const { data: claims, error } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (error || !userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,full_name').eq('id', userId).maybeSingle();
  if (!profile || !['owner', 'admin', 'staff'].includes(profile.role)) redirect('/login?error=unauthorized');
  return <>{children}</>;
}
