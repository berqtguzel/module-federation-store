import { Button, Card, Col, Row, Typography } from 'antd';
import type { AddToBasketHandler, Product } from '../../types/product';
import styles from './ProductCatalog.module.css';

const priceFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2
});

export type ProductCatalogViewProps = {
  products: Product[];
  onAddToBasket?: AddToBasketHandler;
};

export default function ProductCatalogView({ products, onAddToBasket }: ProductCatalogViewProps) {
  return (
    <Row gutter={[{ xs: 16, sm: 20, lg: 24 }, { xs: 16, sm: 20, lg: 24 }]}>
      {products.map((product) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={product.id} className={styles.productColumn}>
          <Card
            hoverable
            className={styles.productCard}
            data-testid="product-card"
            data-product-id={product.id}
            cover={
              <div className={styles.imageFrame}>
                <img src={product.image} alt={product.title} loading="lazy" />
              </div>
            }
          >
            <div className={styles.cardContent}>
              <div>
                <Typography.Text className={styles.category}>{product.category}</Typography.Text>
                <Typography.Title level={3} className={styles.productTitle} title={product.title}>
                  {product.title}
                </Typography.Title>
                <div className={styles.rating} aria-label={`${product.rating.rate} puan, ${product.rating.count} değerlendirme`}>
                  <span aria-hidden="true">★</span>
                  <span>{product.rating.rate.toFixed(1)}</span>
                  <Typography.Text type="secondary">({product.rating.count})</Typography.Text>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <Typography.Text className={styles.price} data-testid="product-price">
                  {priceFormatter.format(product.price)}
                </Typography.Text>
                <Button
                  type="primary"
                  block
                  disabled={!onAddToBasket}
                  onClick={() => onAddToBasket?.(product)}
                  aria-label={`${product.title} ürününü sepete ekle`}
                >
                  Sepete ekle
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
