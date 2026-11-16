import Head from 'next/head';
import ProductCatalog from '../components/catalog/ProductCatalog';

export default function ProductsPage() {
  return (
    <>
      <Head>
        <title>Ürünler | Word Store</title>
        <meta name="description" content="Word Store ürün kataloğu" />
      </Head>
      <main className="products-page">
        <ProductCatalog />
      </main>
    </>
  );
}

