import { createSupabaseServerClient } from '@/lib/supabase/server';
import StorefrontClient, { type StoreProduct } from './storefront-client';

const fallbackProducts: StoreProduct[] = [
{ id: 'menu-papas-chola', name: 'La Chola', category: 'Papas rústicas', price: 1.50, tag: 'CLÁSICA', image_url: null },
{ id: 'menu-papas-mera', name: 'La Mera', category: 'Papas rústicas', price: 1.50, tag: 'FAVORITA', image_url: null },
{ id: 'menu-papas-paisa', name: 'La Paisa', category: 'Papas rústicas', price: 1.50, tag: 'CLÁSICA', image_url: null },
{ id: 'menu-papi-carne', name: 'Papi Carne', category: 'Papas rústicas', price: 1.50, tag: 'CLÁSICA', image_url: null },
{ id: 'menu-salchipapa', name: 'Salchipapa', category: 'Papas rústicas', price: 1.00, tag: 'CLÁSICA', image_url: null },
{ id: 'menu-burger-mera', name: 'La Mera', category: 'Burguers', price: 3.40, tag: 'DESTACADO', image_url: null },
{ id: 'menu-burger-chola', name: 'La Chola', category: 'Burguers', price: 2.50, tag: 'CLÁSICA', image_url: null },
{ id: 'menu-burger-paisa', name: 'La Paisa', category: 'Burguers', price: 2.50, tag: 'CLÁSICA', image_url: null },
{ id: 'menu-hotdog-paisa', name: 'El Paisa', category: 'Hotdogs', price: 1.25, tag: 'CLÁSICO', image_url: null },
{ id: 'menu-hotdog-cholo', name: 'El Cholo', category: 'Hotdogs', price: 1.00, tag: 'CLÁSICO', image_url: null },
{ id: 'menu-drink-colas', name: 'Colas', category: 'Bebidas', price: 0.50, tag: 'BEBIDA', image_url: null },
{ id: 'menu-drink-aguas', name: 'Aguas', category: 'Bebidas', price: 0.50, tag: 'BEBIDA', image_url: null },
{ id: 'menu-drink-juices', name: 'Jugos', category: 'Bebidas', price: 0.50, tag: 'BEBIDA', image_url: null },
{ id: 'menu-drink-tea', name: 'Té helado', category: 'Bebidas', price: 0.50, tag: 'BEBIDA', image_url: null },
{ id: 'menu-drink-jamaica', name: 'Jamaica', category: 'Bebidas', price: 0.50, tag: 'BEBIDA', image_url: null },
{ id: 'menu-extra-carne', name: 'Carne', category: 'Extras', price: 0.50, tag: 'EXTRA', image_url: null },
{ id: 'menu-extra-chorizo', name: 'Chorizo', category: 'Extras', price: 0.50, tag: 'EXTRA', image_url: null },
{ id: 'menu-extra-pollo', name: 'Pollo', category: 'Extras', price: 0.50, tag: 'EXTRA', image_url: null },
{ id: 'menu-extra-queso', name: 'Queso', category: 'Extras', price: 0.50, tag: 'EXTRA', image_url: null },
];

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  let categories = ['Todos', 'Papas rústicas', 'Burguers', 'Hotdogs', 'Bebidas', 'Extras'];
  let products = fallbackProducts;
  let hasLiveProducts = false;
  let logoUrl: string | null = null;
  let isLoggedIn = false;

  if (supabase) {
    const [{ data: categoryRows }, { data: productRows }, { data: settings }, { data: claims }] = await Promise.all([
      supabase.from('categories').select('id,name').eq('is_active', true).order('sort_order'),
      supabase.from('products').select('id,name,description,price,image_url,category_id,is_featured').eq('is_active', true).order('created_at', { ascending: false }).limit(60),
      supabase.from('store_settings').select('logo_url').limit(1).maybeSingle(),
      supabase.auth.getClaims(),
    ]);

    logoUrl = settings?.logo_url ?? null;
    isLoggedIn = Boolean(claims?.claims?.sub);
    if (productRows?.length && categoryRows?.length) categories = ['Todos', ...categoryRows.map((category) => category.name)];
    if (productRows?.length) {
      const categoryNames = new Map((categoryRows ?? []).map((category) => [category.id, category.name]));
      products = productRows.map((product) => ({
        id: product.id,
        name: product.name,
        category: (product.category_id ? categoryNames.get(product.category_id) : undefined) ?? 'Otros',
        price: Number(product.price),
        tag: product.is_featured ? 'DESTACADO' : 'DISPONIBLE',
        image_url: product.image_url,
        description: product.description,
      }));
      hasLiveProducts = true;
    }
  }

  if (!hasLiveProducts) products = fallbackProducts;
  return <StorefrontClient categories={categories} products={products} hasLiveProducts={hasLiveProducts} logoUrl={logoUrl} isLoggedIn={isLoggedIn} />;
}
