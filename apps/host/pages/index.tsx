import Head from 'next/head';
import { useCallback, useMemo, useState } from 'react';
import FederatedRemote from '../components/FederatedRemote';
import { loadRemote } from '../components/loadRemote';
import type {
  BasketItem,
  BasketRemoteProps,
  Product,
  ProductCatalogRemoteProps
} from '../types/commerce';

const productsRemoteUrl = process.env.PRODUCTS_REMOTE_URL || 'http://localhost:3101';
const basketRemoteUrl = process.env.BASKET_REMOTE_URL || 'http://localhost:3102';

const loadProductCatalog = () =>
  loadRemote<ProductCatalogRemoteProps>({
    url: `${productsRemoteUrl}/_next/static/chunks/remoteEntry.js`,
    scope: 'products',
    module: './ProductCatalog'
  });

const loadBasketSummary = () =>
  loadRemote<BasketRemoteProps>({
    url: `${basketRemoteUrl}/remoteEntry.js`,
    scope: 'basket',
    module: './BasketSummary'
  });

export default function HomePage() {
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);

  const handleAddToBasket = useCallback((product: Product) => {
    setBasketItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...currentItems,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1
        }
      ];
    });
  }, []);

  const handleIncrease = useCallback((productId: number) => {
    setBasketItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const handleDecrease = useCallback((productId: number) => {
    setBasketItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  }, []);

  const handleRemove = useCallback((productId: number) => {
    setBasketItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  }, []);

  const productCatalogProps = useMemo(
    () => ({ onAddToBasket: handleAddToBasket }),
    [handleAddToBasket]
  );
  const basketProps = useMemo(
    () => ({
      items: basketItems,
      onIncrease: handleIncrease,
      onDecrease: handleDecrease,
      onRemove: handleRemove
    }),
    [basketItems, handleDecrease, handleIncrease, handleRemove]
  );

  return (
    <>
      <Head>
        <title>Word Store Federation</title>
        <meta name="description" content="Module Federation storefront foundation" />
      </Head>
      <main className="page-shell">
        <header className="hero">
          <span className="eyebrow">Word Frontend Developer Case Study</span>
          <h1>Bağımsız uygulamalar, tek mağaza deneyimi</h1>
          <p>Products ve Basket uygulamaları çalışma zamanında remote entry dosyalarından yüklenir.</p>
        </header>
        <section className="remote-grid" aria-label="Federated uygulamalar">
          <div className="products-slot">
            <FederatedRemote
              label="Ürünler"
              loader={loadProductCatalog}
              componentProps={productCatalogProps}
            />
          </div>
          <aside className="basket-slot">
            <FederatedRemote label="Sepet" loader={loadBasketSummary} componentProps={basketProps} />
          </aside>
        </section>
      </main>
    </>
  );
}

