import { createSupabaseServerClient } from '@/lib/supabase/server';
import StorefrontClient, { type StoreProduct } from './storefront-client';

const fallbackProducts: StoreProduct[] = [];

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  let categories = ['Todos', 'Hamburguesas', 'Salchipapas', 'Hot Dogs', 'Combos', 'Papas y Extras', 'Bebidas'];
  let products = fallbackProducts;
  let hasLiveProducts = false;

  if (supabase) {
    const [{ data: categoryRows }, { data: productRows }] = await Promise.all([
      supabase.from('categories').select('id,name').eq('is_active', true).order('sort_order'),
      supabase.from('products').select('id,name,description,price,image_url,category_id,is_featured').eq('is_active', true).order('created_at', { ascending: false }).limit(60),
    ]);

    if (categoryRows?.length) categories = ['Todos', ...categoryRows.map((category) => category.name)];
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

  return <StorefrontClient categories={categories} products={products} hasLiveProducts={hasLiveProducts} />;
}
