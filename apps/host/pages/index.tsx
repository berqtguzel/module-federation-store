import Head from 'next/head';
import FederatedRemote from '../components/FederatedRemote';
import { loadRemote } from '../components/loadRemote';

const productsRemoteUrl = process.env.PRODUCTS_REMOTE_URL || 'http://localhost:3101';
const basketRemoteUrl = process.env.BASKET_REMOTE_URL || 'http://localhost:3102';

const loadProductCard = () =>
  loadRemote({
    url: `${productsRemoteUrl}/_next/static/chunks/remoteEntry.js`,
    scope: 'products',
    module: './ProductCard'
  });

const loadBasketSummary = () =>
  loadRemote({
    url: `${basketRemoteUrl}/remoteEntry.js`,
    scope: 'basket',
    module: './BasketSummary'
  });

export default function HomePage() {
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
          <FederatedRemote label="Ürünler" loader={loadProductCard} />
          <FederatedRemote label="Sepet" loader={loadBasketSummary} />
        </section>
      </main>
    </>
  );
}

