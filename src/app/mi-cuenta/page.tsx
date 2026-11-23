import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Clock3, CheckCircle2, Package, QrCode, Stamp, Utensils } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendCustomerAccess } from './actions';
import MobileBottomNav from '../mobile-bottom-nav';
import CustomerQrScanner from './customer-qr-scanner';

const statusLabels: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'En preparación',
  ready: 'Listo', out_for_delivery: 'En camino', completed: 'Completado', cancelled: 'Cancelado',
};
const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-red-50 text-red-700',
  out_for_delivery: 'bg-blue-50 text-blue-700', ready: 'bg-blue-50 text-blue-700',
};

export default async function CustomerAccountPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; scan?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <main className="min-h-screen grid place-items-center p-6">Servicio temporalmente no disponible.</main>;

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;

  if (!userId) {
    return <main className="min-h-screen bg-[#fffdf8] px-4 py-10 pb-28 text-[#171717]">
      <div className="mx-auto max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500"><ArrowLeft size={15}/> Volver al menú</Link>
        <section className="mt-8 rounded-[26px] border border-black/[.06] bg-white p-7 shadow-sm sm:p-9">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#ffe600]"><Utensils size={25}/></div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[.2em] text-neutral-400">PAPAMERICANA</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.05em]">Mi cuenta</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">Ingresa tu correo y te enviaremos un enlace seguro para consultar tus pedidos y tus sellos.</p>
          {params.sent === '1' ? <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">Te enviamos un enlace de acceso. Revisa tu bandeja de entrada y también la carpeta de spam.</div> : <form action={sendCustomerAccess} className="mt-7 space-y-3">
            <label className="block text-xs font-bold text-neutral-700" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="tucorreo@ejemplo.com" className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-sm outline-none focus:border-black"/>
            {params.error && <p className="text-xs font-semibold text-red-600">{params.error === 'email' ? 'Ingresa un correo válido.' : params.error === 'config' ? 'El acceso no está configurado. Intenta más tarde.' : 'No pudimos enviar el enlace. Intenta nuevamente.'}</p>}
            <button className="w-full rounded-full bg-[#ffe600] px-5 py-4 text-sm font-black text-black transition hover:bg-black hover:text-[#ffe600]">Enviar enlace de acceso</button>
          </form>}
          <p className="mt-5 text-[10px] leading-5 text-neutral-400">Usa el mismo correo que registraste al realizar tu pedido. No necesitas recordar una contraseña.</p>
        </section>
      </div>
    </main>;
  }

  const { data: customer } = await supabase.from('customers')
    .select('id,full_name,email,phone,loyalty_stamps,loyalty_qr_token')
    .eq('auth_user_id', userId).maybeSingle();

  if (!customer) {
    return <main className="min-h-screen bg-[#fffdf8] px-4 py-10 text-[#171717]"><div className="mx-auto max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500"><ArrowLeft size={15}/> Volver al menú</Link>
      <section className="mt-8 rounded-[26px] border border-black/[.06] bg-white p-8">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#ffe600]"><Package size={25}/></div>
        <h1 className="mt-5 text-3xl font-black">¡Hola!</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500">Tu correo ya está verificado, pero todavía no encontramos pedidos registrados con este mismo correo. Realiza tu primer pedido usando este correo para activar tu perfil y tu tarjeta de sellos.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-xs font-black text-white">Ver menú</Link>
      </section>
    </div></main>;
  }

  const [{ data: orders }, { data: loyalty }] = await Promise.all([
    supabase.from('orders').select('id,order_number,status,payment_status,total,created_at,fulfillment_type,order_items(product_name,quantity,line_total)').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('loyalty_settings').select('stamps_required,reward_description,is_active').eq('id', true).maybeSingle(),
  ]);

  const required = loyalty?.stamps_required ?? 6;
  const stamps = customer.loyalty_stamps ?? 0;
  const progress = loyalty?.is_active ? Math.min(100, Math.round((stamps % required) / required * 100)) : 0;
  const qrTarget = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://papamericana-app.vercel.app'}/admin/loyalty/scan?token=${customer.loyalty_qr_token}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(qrTarget)}`;

  return <main className="min-h-screen bg-[#fffdf8] px-4 py-8 pb-28 text-[#171717] sm:px-7">
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500"><ArrowLeft size={15}/> Volver al menú</Link><form action={async () => { 'use server'; const s = await createSupabaseServerClient(); await s?.auth.signOut(); redirect('/mi-cuenta'); }}><button className="text-xs font-bold text-neutral-500 hover:text-black">Cerrar sesión</button></form></div>
      <header className="mt-8"><p className="text-[10px] font-black uppercase tracking-[.2em] text-neutral-400">PAPAMERICANA · MI CUENTA</p><h1 className="mt-2 text-3xl font-black tracking-[-.05em] sm:text-4xl">¡Hola, {customer.full_name.split(' ')[0]}!</h1><p className="mt-2 text-sm text-neutral-500">Aquí puedes revisar tus pedidos y tus beneficios.</p></header>
      {params.scan === '1' && <CustomerQrScanner/>}

      <section id="perfil" className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <article className="overflow-hidden rounded-[24px] bg-[#171717] p-6 text-white sm:p-8">
          <div className="flex items-center gap-2 text-[#ffe600]"><Stamp size={18}/><span className="text-[10px] font-black uppercase tracking-[.2em]">Mi tarjeta de sellos</span></div>
          <div className="mt-5 flex items-end gap-2"><span className="text-6xl font-black tracking-[-.07em]">{stamps % required}</span><span className="pb-2 text-sm font-bold text-white/50">/ {required} sellos</span></div>
          <div className="mt-5 grid grid-cols-6 gap-2 sm:gap-3">{Array.from({length: required}, (_,i) => <div key={i} className={'grid aspect-square place-items-center rounded-xl border ' + (i < stamps % required ? 'border-[#ffe600] bg-[#ffe600] text-black' : 'border-white/15 bg-white/5 text-white/25')}><Stamp size={18}/></div>)}</div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ffe600] transition-all" style={{width: progress + '%'}}/></div>
          <p className="mt-3 text-xs text-white/60">{loyalty?.reward_description || 'Sigue acumulando sellos con tus compras.'}</p>
          <p className="mt-1 text-[10px] text-white/40">1 sello por cada compra completada y pagada.</p>
        </article>
        <article className="rounded-[24px] border border-black/[.06] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex w-fit items-center gap-2 text-neutral-500"><QrCode size={17}/><span className="text-[10px] font-black uppercase tracking-[.18em]">Mi QR personal</span></div>
          <img src={qrUrl} alt="Código QR personal de fidelización" className="mx-auto mt-4 h-48 w-48 rounded-xl border border-neutral-100 bg-white p-2"/>
          <p className="mt-3 text-sm font-black">Identifícate en el local</p><p className="mx-auto mt-1 max-w-xs text-[11px] leading-5 text-neutral-500">Muestra este código al personal antes de pagar para registrar tu compra y sumar tu sello.</p>
        </article>
      </section>

      <section id="pedidos" className="mt-9 scroll-mt-24"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-neutral-400">Tu actividad</p><h2 className="mt-1 text-2xl font-black tracking-[-.04em]">Mis pedidos</h2></div><span className="rounded-full bg-[#fff3b0] px-3 py-1.5 text-[10px] font-black">{orders?.length ?? 0} pedidos</span></div>
        <div className="mt-4 space-y-3">{(orders ?? []).map(order => <article key={order.id} className="rounded-2xl border border-black/[.06] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold text-neutral-400">PEDIDO #{order.order_number} · {new Date(order.created_at).toLocaleDateString('es-EC',{day:'2-digit',month:'short',year:'numeric'})}</p><p className="mt-1 text-lg font-black">${Number(order.total).toFixed(2)}</p></div><span className={'rounded-full px-3 py-1.5 text-[10px] font-black ' + (statusStyles[order.status] || 'bg-neutral-100 text-neutral-600')}>{statusLabels[order.status] || order.status}</span></div>
          <div className="mt-3 border-t border-neutral-100 pt-3">{(order.order_items ?? []).map((item: {product_name:string;quantity:number;line_total:number},i:number)=><div key={i} className="flex justify-between gap-3 py-1 text-xs text-neutral-500"><span>{item.quantity} × {item.product_name}</span><span>${Number(item.line_total).toFixed(2)}</span></div>)}</div>
        </article>)}{!orders?.length && <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center"><Clock3 className="mx-auto text-neutral-300"/><p className="mt-3 font-bold">Todavía no tienes pedidos</p><Link href="/" className="mt-4 inline-flex rounded-full bg-[#ffe600] px-5 py-3 text-xs font-black">Explorar el menú</Link></div>}</div>
      </section>
      <p className="mt-8 text-center text-[10px] text-neutral-400">¿Necesitas ayuda? Contacta con PAPAMERICANA.</p>
    </div>
    <MobileBottomNav />
  </main>;
}
