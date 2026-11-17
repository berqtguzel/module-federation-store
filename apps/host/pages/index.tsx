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
  const basketItemCount = useMemo(
    () => basketItems.reduce((total, item) => total + item.quantity, 0),
    [basketItems]
  );

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
        <meta name="description" content="Word Store ürün kataloğu" />
      </Head>
      <header className="store-nav">
        <div className="store-nav-inner">
          <span className="store-name">Word Store</span>
          <a className="basket-link" href="#basket-panel" aria-label={`Sepete git, ${basketItemCount} ürün`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H7" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span>Sepet</span>
            <span className="basket-badge" data-testid="nav-basket-count">{basketItemCount}</span>
          </a>
        </div>
      </header>
      <main className="page-shell">
        <section className="remote-grid" aria-label="Federated uygulamalar">
          <div className="products-slot">
            <FederatedRemote
              label="Ürünler"
              loader={loadProductCatalog}
              componentProps={productCatalogProps}
            />
          </div>
          <aside className="basket-slot" id="basket-panel">
            <FederatedRemote label="Sepet" loader={loadBasketSummary} componentProps={basketProps} />
          </aside>
        </section>
      </main>
    </>
  );
}
