import { createSupabaseServerClient } from '@/lib/supabase/server';
import CheckoutClient from './checkout-client';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const params = await searchParams;
  let items = '[]';
  try {
    const parsed = JSON.parse(params.items ?? '[]');
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.length <= 30) items = JSON.stringify(parsed);
  } catch {}
  const supabase = await createSupabaseServerClient();
  let zones: { id: string; name: string; delivery_fee: number; min_order_amount: number }[] = [];
  let acceptsDelivery = true, acceptsPickup = true;
  if (supabase) {
    const [{ data: zoneRows }, { data: settings }] = await Promise.all([
      supabase.from('delivery_zones').select('id,name,delivery_fee,min_order_amount').eq('is_active', true).order('name'),
      supabase.from('store_settings').select('accepts_delivery,accepts_pickup').limit(1).maybeSingle(),
    ]);
    zones = (zoneRows ?? []).map(z => ({ ...z, delivery_fee: Number(z.delivery_fee), min_order_amount: Number(z.min_order_amount) }));
    acceptsDelivery = settings?.accepts_delivery ?? true;
    acceptsPickup = settings?.accepts_pickup ?? true;
  }
  return <CheckoutClient items={items} zones={zones} acceptsDelivery={acceptsDelivery} acceptsPickup={acceptsPickup}/>;
}
