'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, BellRing, X, ExternalLink, Volume2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type OrderAlert = {
  id: string;
  order_number: number;
  customer_name: string;
  total: number;
  created_at: string;
};

export default function OrdersNotifications() {
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supportsNotifications, setSupportsNotifications] = useState(false);
  const [connected, setConnected] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const unreadCount = alerts.length;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setSupportsNotifications(true);
      setPermission(Notification.permission);
    }
    let supabase: ReturnType<typeof createSupabaseBrowserClient>;
    try { supabase = createSupabaseBrowserClient(); }
    catch { return; }

    const seenKey = 'papamericana_admin_orders_seen_at';
    const lastSeen = window.localStorage.getItem(seenKey);
    const initialCutoff = lastSeen || new Date().toISOString();
    const knownIds = new Set<string>();
    let mounted = true;

    const addAlert = (order: OrderAlert) => {
      if (!order?.id || knownIds.has(order.id)) return;
      knownIds.add(order.id);
      if (!mounted) return;
      setAlerts(current => [order, ...current].slice(0, 8));
      window.localStorage.setItem(seenKey, new Date().toISOString());
      if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
        const notice = new Notification('Nuevo pedido · PAPAMERICANA', {
          body: `Pedido #${order.order_number} · ${order.customer_name} · $${Number(order.total).toFixed(2)}`,
          tag: `papamericana-order-${order.id}`,
          icon: '/favicon.ico',
        });
        notice.onclick = () => { window.focus(); window.location.href = '/admin/orders'; };
      }
    };

    let cursor = initialCutoff;
    const fetchMissedOrders = async () => {
      const { data } = await supabase.from('orders')
        .select('id,order_number,customer_name,total,created_at')
        .gt('created_at', cursor)
        .order('created_at', { ascending: true })
        .limit(30);
      if (!mounted || !data) return;
      for (const row of data) {
        addAlert({
          id: row.id,
          order_number: row.order_number,
          customer_name: row.customer_name,
          total: Number(row.total),
          created_at: row.created_at,
        });
        if (row.created_at > cursor) cursor = row.created_at;
      }
      if (data.length) window.localStorage.setItem(seenKey, cursor);
    };

    const channel = supabase
      .channel('admin-new-orders-global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        const row = payload.new as Record<string, unknown>;
        const createdAt = String(row.created_at || new Date().toISOString());
        addAlert({
          id: String(row.id),
          order_number: Number(row.order_number),
          customer_name: String(row.customer_name || 'Cliente'),
          total: Number(row.total || 0),
          created_at: createdAt,
        });
        if (createdAt > cursor) {
          cursor = createdAt;
          window.localStorage.setItem(seenKey, cursor);
        }
      })
      .subscribe(status => {
        if (mounted) {
          setConnected(status === 'SUBSCRIBED');
          if (status === 'SUBSCRIBED') void fetchMissedOrders();
        }
      });

    if (!lastSeen) window.localStorage.setItem(seenKey, initialCutoff);
    // Respaldo: si el WebSocket se interrumpe, consulta pedidos nuevos sin recargar.
    const poll = window.setInterval(() => { void fetchMissedOrders(); }, 10000);

    return () => {
      mounted = false;
      window.clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, []);

  const requestDesktopPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const newestAlert = useMemo(() => alerts[0], [alerts]);

  return <>
    <div className="relative">
      <button type="button" onClick={() => setPanelOpen(value => !value)} aria-label="Notificaciones de pedidos"
        className="relative grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition hover:border-black">
        {unreadCount > 0 ? <BellRing size={18}/> : <Bell size={18}/>}
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ffd21c] px-1 text-[10px] font-black text-black">{unreadCount}</span>}
      </button>
      {panelOpen && <div className="absolute right-0 top-12 z-[70] w-[min(90vw,360px)] overflow-hidden rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between border-b p-4"><div><p className="text-sm font-black">Notificaciones</p><p className="text-[11px] text-neutral-500">{connected ? 'Conectado en tiempo real' : 'Conectando…'}</p></div><button onClick={()=>setPanelOpen(false)} className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"><X size={16}/></button></div>
        {alerts.length ? <div className="max-h-80 divide-y overflow-y-auto">{alerts.map(order=><div key={order.id} className="p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Nuevo pedido</p><p className="mt-1 text-sm font-black">Pedido #{order.order_number}</p><p className="text-xs text-neutral-600">{order.customer_name} · ${Number(order.total).toFixed(2)}</p><div className="mt-3 flex items-center justify-between"><Link href="/admin/orders" onClick={()=>setPanelOpen(false)} className="inline-flex items-center gap-1 text-xs font-bold text-black underline">Ver pedido <ExternalLink size={12}/></Link><button onClick={()=>setAlerts(current=>current.filter(item=>item.id!==order.id))} className="text-[11px] text-neutral-400 hover:text-black">Descartar</button></div></div>)}</div> : <div className="p-6 text-center"><Bell size={22} className="mx-auto text-neutral-300"/><p className="mt-2 text-sm font-bold">No hay pedidos nuevos</p><p className="mt-1 text-xs text-neutral-500">Te avisaremos cuando entre uno.</p></div>}
        {supportsNotifications && permission !== 'granted' && <div className="border-t bg-neutral-50 p-3"><button onClick={requestDesktopPermission} className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-xs font-bold text-white"><Volume2 size={14}/> Activar alertas de escritorio</button></div>}
      </div>}
    </div>
    {newestAlert && !panelOpen && <div className="fixed right-5 top-[82px] z-[80] w-[min(92vw,390px)] animate-in slide-in-from-top-2 rounded-2xl border border-[#f0d35a] bg-white p-4 text-neutral-900 shadow-2xl duration-200">
      <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff2a8]"><BellRing size={19}/></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-sm font-black">¡Nuevo pedido recibido!</p><button onClick={()=>setAlerts(current=>current.filter(item=>item.id!==newestAlert.id))} aria-label="Cerrar alerta" className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100"><X size={15}/></button></div><p className="mt-1 text-xs text-neutral-600">Pedido #{newestAlert.order_number} · {newestAlert.customer_name}</p><p className="mt-1 text-sm font-black">${Number(newestAlert.total).toFixed(2)}</p><Link href="/admin/orders" className="mt-3 inline-flex rounded-full bg-black px-4 py-2 text-xs font-bold text-white">Revisar pedido</Link></div></div>
    </div>}
  </>;
}
