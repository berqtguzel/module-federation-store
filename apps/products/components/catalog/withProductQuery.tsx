import type { ComponentType } from 'react';
import { Alert, Button, Empty } from 'antd';
import { useGetProductsQuery } from '../../api/productsApi';
import type { ProductCatalogViewProps } from './ProductCatalogView';
import CatalogSkeleton from './CatalogSkeleton';
import styles from './ProductCatalog.module.css';

type ProductQueryProps = Omit<ProductCatalogViewProps, 'products'>;

export default function withProductQuery(Component: ComponentType<ProductCatalogViewProps>) {
  function ProductQueryBoundary(props: ProductQueryProps) {
    const { data, isLoading, isError, refetch } = useGetProductsQuery();

    if (isLoading) {
      return <CatalogSkeleton />;
    }

    if (isError) {
      return (
        <Alert
          className={styles.statePanel}
          type="error"
          showIcon
          message="Ürünler yüklenemedi"
          description="Ürün servisine şu anda ulaşılamıyor. Bağlantınızı kontrol edip yeniden deneyin."
          action={<Button onClick={() => void refetch()}>Tekrar dene</Button>}
        />
      );
    }

    if (!data?.length) {
      return (
        <div className={styles.statePanel}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Gösterilecek ürün bulunamadı" />
        </div>
      );
    }

    return <Component {...props} products={data} />;
  }

  ProductQueryBoundary.displayName = `withProductQuery(${Component.displayName || Component.name || 'Component'})`;
  return ProductQueryBoundary;
}
