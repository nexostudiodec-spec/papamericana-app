import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/login?error=config');
  const { data: claims, error } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (error || !userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,full_name').eq('id', userId).maybeSingle();
  if (!profile || !['owner', 'admin', 'staff'].includes(profile.role)) redirect('/login?error=unauthorized');
  return <>{children}</>;
}
