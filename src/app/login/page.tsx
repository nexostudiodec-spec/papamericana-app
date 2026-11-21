import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signIn } from './actions';

const messages: Record<string, string> = {
  missing: 'Ingresa tu correo y contraseña.',
  invalid: 'Las credenciales no son correctas.',
  unauthorized: 'Tu usuario no tiene acceso al panel.',
  config: 'La conexión de autenticación no está configurada.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.auth.getClaims();
    if (data?.claims?.sub) redirect('/admin');
  }
  const { error } = await searchParams;
  return <main className="min-h-screen bg-[#171717] px-5 py-12 text-[#171717]">
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center"><div className="w-full rounded-[28px] bg-white p-8 shadow-2xl">
      <a href="/" className="text-xs font-bold text-neutral-500">← Volver a la tienda</a>
      <div className="mt-8 inline-grid h-14 w-14 place-items-center rounded-2xl bg-[#ffd21c] text-2xl font-black">P</div>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[.22em] text-neutral-400">PAPAMERICANA</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Panel administrador</h1>
      <p className="mt-2 text-sm text-neutral-500">Inicia sesión para gestionar el restaurante.</p>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{messages[error] ?? 'No fue posible iniciar sesión.'}</p>}
      <form action={signIn} className="mt-7 space-y-4">
        <label className="block text-xs font-bold">Correo electrónico<input name="email" type="email" autoComplete="username" required className="field-input"/></label>
        <label className="block text-xs font-bold">Contraseña<input name="password" type="password" autoComplete="current-password" required className="field-input"/></label>
        <button className="w-full rounded-xl bg-[#ffd21c] px-5 py-4 text-sm font-black hover:bg-black hover:text-[#ffd21c]">Ingresar al panel</button>
      </form>
      <p className="mt-5 text-[10px] leading-5 text-neutral-400">Acceso exclusivo para usuarios autorizados en PAPAMERICANA.</p>
    </div></div>
    <style>{`.field-input{display:block;width:100%;margin-top:7px;border:1px solid #e5e5e5;border-radius:10px;padding:11px 12px;font-size:13px;outline:none}.field-input:focus{border-color:#171717}`}</style>
  </main>;
}
