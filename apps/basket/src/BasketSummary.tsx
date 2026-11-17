import React, { useEffect, useMemo, useRef } from 'react';
import { Button, ConfigProvider, Empty, Image, List, Typography, message } from 'antd';
import trTR from 'antd/locale/tr_TR';
import type { BasketItem, BasketSummaryProps } from './types';
import './BasketSummary.css';

const priceFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2
});

export default function BasketSummary({ items, onIncrease, onDecrease, onRemove }: BasketSummaryProps) {
  const [messageApi, messageContext] = message.useMessage({ maxCount: 1 });
  const previousItemsRef = useRef<BasketItem[] | null>(null);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  useEffect(() => {
    const previousItems = previousItemsRef.current;

    if (previousItems) {
      const addedItem = items.find((item) => {
        const previousQuantity = previousItems.find((previousItem) => previousItem.id === item.id)?.quantity || 0;
        return item.quantity > previousQuantity;
      });

      if (addedItem) {
        messageApi.open({
          key: 'basket-added',
          type: 'success',
          content: `${addedItem.title} sepete eklendi`,
          duration: 1.2
        });
      }
    }

    previousItemsRef.current = items;
  }, [items, messageApi]);

  return (
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
            controlHeight: 36,
            fontWeight: 600
          }
        }
      }}
    >
      {messageContext}
      <section className="basket-remote" data-testid="basket-remote">
        <header className="basket-header">
          <div>
            <Typography.Title level={2}>Sepet</Typography.Title>
          </div>
          <span className="basket-count" data-testid="basket-count">
            {itemCount} ürün
          </span>
        </header>

        {items.length === 0 ? (
          <Empty
            className="basket-empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Sepetiniz henüz boş"
          />
        ) : (
          <>
            <List
              className="basket-list"
              dataSource={items}
              split
              renderItem={(item) => (
                <List.Item data-testid="basket-item" data-product-id={item.id}>
                  <div className="basket-item">
                    <Image width={64} height={72} src={item.image} alt={item.title} preview={false} />
                    <div className="basket-item-content">
                      <Typography.Text className="basket-item-title" ellipsis={{ tooltip: item.title }}>
                        {item.title}
                      </Typography.Text>
                      <Typography.Text type="secondary" className="basket-unit-price">
                        Birim fiyat: {priceFormatter.format(item.price)}
                      </Typography.Text>
                      <div className="basket-quantity" aria-label={`${item.title} adedi`}>
                        <Button
                          size="small"
                          disabled={item.quantity === 1}
                          onClick={() => onDecrease(item.id)}
                          aria-label="Adedi azalt"
                          data-testid="decrease-item"
                        >
                          −
                        </Button>
                        <span data-testid="item-quantity">{item.quantity}</span>
                        <Button
                          size="small"
                          onClick={() => onIncrease(item.id)}
                          aria-label="Adedi artır"
                          data-testid="increase-item"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="basket-item-aside">
                      <Typography.Text strong className="basket-line-total">
                        {priceFormatter.format(item.price * item.quantity)}
                      </Typography.Text>
                      <Button type="link" danger onClick={() => onRemove(item.id)} data-testid="remove-item">
                        Sil
                      </Button>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            <div className="basket-total-row">
              <Typography.Text>Ara toplam</Typography.Text>
              <Typography.Text strong data-testid="basket-total">
                {priceFormatter.format(total)}
              </Typography.Text>
            </div>
          </>
        )}
      </section>
    </ConfigProvider>
  );
}
