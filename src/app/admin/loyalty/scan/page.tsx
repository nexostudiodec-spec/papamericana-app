import Link from 'next/link';
import { ArrowLeft, BadgeCheck, QrCode, UserRound } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { registerInStoreStamp } from './actions';

export default async function LoyaltyScanPage({ searchParams }: { searchParams: Promise<{token?:string;error?:string;saved?:string}> }) {
  const params = await searchParams;
  const token = params.token ?? '';
  const s = await createSupabaseServerClient();
  const { data: customer } = token && s ? await s.from('customers').select('id,full_name,phone,email,loyalty_stamps').eq('loyalty_qr_token', token).maybeSingle() : {data:null};
  return <main className="min-h-screen bg-[#f6f6f3] px-4 py-8 text-neutral-900 sm:px-8"><div className="mx-auto max-w-xl">
    <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500"><ArrowLeft size={15}/> Panel</Link>
    <div className="mt-7 rounded-[24px] border border-neutral-200 bg-white p-6 sm:p-8">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffe600]"><QrCode size={23}/></div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[.2em] text-neutral-400">Fidelización PAPAMERICANA</p>
      <h1 className="mt-1 text-2xl font-black">Registrar compra presencial</h1>
      <p className="mt-2 text-sm leading-6 text-neutral-500">Escanea el QR del cliente o pega el token de su enlace para localizar su tarjeta.</p>
      {!token && <form className="mt-6 flex gap-2" action="/admin/loyalty/scan" method="get"><input name="token" placeholder="Token QR" className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm"/><button className="rounded-xl bg-black px-5 text-xs font-black text-white">Buscar</button></form>}
      {customer && <div className="mt-6 rounded-2xl bg-neutral-50 p-5">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#ffe600]"><UserRound size={20}/></div><div><h2 className="font-black">{customer.full_name}</h2><p className="text-xs text-neutral-500">{customer.phone} · {customer.email || 'Sin correo'}</p></div></div>
        <p className="mt-5 text-sm text-neutral-600">Sellos acumulados: <b className="text-black">{customer.loyalty_stamps}</b></p>
        <form action={registerInStoreStamp} className="mt-4 space-y-3"><input type="hidden" name="token" value={token}/><input name="note" placeholder="Nota (opcional)" className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"/><button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ffe600] px-5 py-4 text-sm font-black"><BadgeCheck size={17}/> Registrar 1 sello</button></form>
      </div>}
      {params.saved==='1' && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Sello registrado correctamente.</p>}
      {params.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{params.error==='notfound'?'No encontramos una cuenta con ese QR.':'No se pudo registrar el sello. Verifica e intenta nuevamente.'}</p>}
    </div>
  </div></main>;
}
