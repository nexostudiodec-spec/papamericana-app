import { createSupabaseServerClient } from '@/lib/supabase/server';
import StorefrontClient, { type StoreProduct } from './storefront-client';

const fallbackProducts: StoreProduct[] = [
  { id: 'demo-1', name: 'Producto destacado 01', category: 'Despensa', price: 0, tag: 'DESTACADO', image_url: null },
  { id: 'demo-2', name: 'Producto destacado 02', category: 'Bebidas', price: 0, tag: 'POPULAR', image_url: null },
  { id: 'demo-3', name: 'Producto destacado 03', category: 'Hogar', price: 0, tag: 'NOVEDAD', image_url: null },
  { id: 'demo-4', name: 'Producto destacado 04', category: 'Cuidado personal', price: 0, tag: 'RECOMENDADO', image_url: null },
];

export default async function Home() {
  const supabase = createSupabaseServerClient();
  let categories = ['Todos', 'Despensa', 'Bebidas', 'Hogar', 'Cuidado personal'];
  let products = fallbackProducts;
  let hasLiveProducts = false;

  if (supabase) {
    const [{ data: categoryRows }, { data: productRows }] = await Promise.all([
      supabase.from('categories').select('id,name').eq('is_active', true).order('sort_order'),
      supabase.from('products').select('id,name,price,image_url,category_id,is_featured').eq('is_active', true).order('created_at', { ascending: false }).limit(24),
    ]);

    if (categoryRows?.length) categories = ['Todos', ...categoryRows.map((category) => category.name)];
    if (productRows?.length) {
      const categoryNames = new Map((categoryRows ?? []).map((category) => [category.id, category.name]));
      products = productRows.map((product) => ({
        id: product.id,
        name: product.name,
        category: (product.category_id ? categoryNames.get(product.category_id) : undefined) ?? 'Productos',
        price: Number(product.price),
        tag: product.is_featured ? 'DESTACADO' : 'DISPONIBLE',
        image_url: product.image_url,
      }));
      hasLiveProducts = true;
    }
  }

  return <StorefrontClient categories={categories} products={products} hasLiveProducts={hasLiveProducts} />;
}
