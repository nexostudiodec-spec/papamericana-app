'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function placeOrder(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: 'No se pudo conectar con la tienda. Intenta nuevamente.' };

  let items: unknown;
  try { items = JSON.parse(String(formData.get('items') ?? '[]')); }
  catch { return { ok: false, error: 'No pudimos leer tu carrito.' }; }

  const payload = {
    p_customer_name: String(formData.get('customer_name') ?? '').trim(),
    p_customer_phone: String(formData.get('customer_phone') ?? '').trim(),
    p_customer_email: String(formData.get('customer_email') ?? '').trim() || null,
    p_fulfillment_type: String(formData.get('fulfillment_type') ?? 'pickup'),
    p_delivery_address: String(formData.get('delivery_address') ?? '').trim() || null,
    p_delivery_zone_id: String(formData.get('delivery_zone_id') ?? '').trim() || null,
    p_delivery_instructions: String(formData.get('delivery_instructions') ?? '').trim() || null,
    p_payment_method: String(formData.get('payment_method') ?? 'cash'),
    p_customer_notes: String(formData.get('customer_notes') ?? '').trim() || null,
    p_items: items,
  };

  if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
    return { ok: false, error: 'Tu carrito está vacío o tiene demasiados productos.' };
  }
  const { data, error } = await supabase.rpc('place_store_order', payload);
  if (error) return { ok: false, error: error.message.includes('') ? error.message : 'No pudimos registrar tu pedido. Revisa tus datos e inténtalo otra vez.' };

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  return { ok: true, order: data as { order_id: string; order_number: number; subtotal: number; delivery_fee: number; total: number } };
}
