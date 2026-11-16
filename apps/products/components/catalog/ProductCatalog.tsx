import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { Provider } from 'react-redux';
import { productsStore } from '../../store/productsStore';
import type { AddToBasketHandler } from '../../types/product';
import ProductCatalogView from './ProductCatalogView';
import withProductQuery from './withProductQuery';
import styles from './ProductCatalog.module.css';

const CatalogWithQuery = withProductQuery(ProductCatalogView);

export type ProductCatalogProps = {
  onAddToBasket?: AddToBasketHandler;
};

export default function ProductCatalog({ onAddToBasket }: ProductCatalogProps) {
  return (
    <Provider store={productsStore}>
      <ConfigProvider
        locale={trTR}
        theme={{
          token: {
            colorPrimary: '#1677ff',
            colorText: '#1f1f1f',
            colorTextSecondary: '#667085',
            colorBorderSecondary: '#eaecf0',
            borderRadius: 10,
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          },
          components: {
            Button: {
              controlHeight: 42,
              fontWeight: 600
            },
            Card: {
              bodyPadding: 18
            }
          }
        }}
      >
        <section className={styles.catalog} data-testid="products-remote">
          <header className={styles.catalogHeader}>
            <div>
              <span className={styles.eyebrow}>Koleksiyon</span>
              <h2>Günün ürünleri</h2>
            </div>
            <p>Özenle seçilmiş ürünleri keşfedin. Fiyatlar USD olarak gösterilir.</p>
          </header>
          <CatalogWithQuery onAddToBasket={onAddToBasket} />
        </section>
      </ConfigProvider>
    </Provider>
  );
}
