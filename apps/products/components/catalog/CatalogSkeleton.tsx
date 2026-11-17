import { Card, Col, Row, Skeleton } from 'antd';
import styles from './ProductCatalog.module.css';

export default function CatalogSkeleton() {
  return (
    <Row gutter={[{ xs: 16, sm: 20, lg: 24 }, { xs: 16, sm: 20, lg: 24 }]} aria-label="Ürünler yükleniyor">
      {Array.from({ length: 8 }, (_, index) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={index}>
          <Card className={styles.productCard} cover={<Skeleton.Image active className={styles.skeletonImage} />}>
            <Skeleton active paragraph={{ rows: 3 }} title={{ width: '72%' }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
