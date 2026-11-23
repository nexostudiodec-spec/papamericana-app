import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AdminShell from './admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
 const supabase=await createSupabaseServerClient();
 if(!supabase) redirect('/login?error=config');
 const {data:claims,error}=await supabase.auth.getClaims();
 const userId=claims?.claims?.sub;
 if(error||!userId) redirect('/login');
 const [{data:profile},{data:settings}]=await Promise.all([
  supabase.from('profiles').select('role,full_name').eq('id',userId).maybeSingle(),
  supabase.from('store_settings').select('store_name,logo_url').limit(1).maybeSingle()
 ]);
 if(!profile||!['owner','admin','staff'].includes(profile.role)) redirect('/login?error=unauthorized');
 return <AdminShell logoUrl={settings?.logo_url??null} storeName={settings?.store_name||'PAPAMERICANA'}>{children}</AdminShell>;
}