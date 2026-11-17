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
            borderRadius: 8,
            fontSize: 14,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif'
          },
          components: {
            Button: {
              controlHeight: 38,
              fontWeight: 600
            },
            Card: {
              bodyPadding: 16
            }
          }
        }}
      >
        <section className={styles.catalog} data-testid="products-remote">
          <header className={styles.catalogHeader}>
            <h2>Ürünler</h2>
            <p>Özenle seçilmiş ürünleri keşfedin. Fiyatlar USD olarak gösterilir.</p>
          </header>
          <CatalogWithQuery onAddToBasket={onAddToBasket} />
        </section>
      </ConfigProvider>
    </Provider>
  );
}
