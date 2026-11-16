import React from 'react';
import BasketSummary from './BasketSummary';

export default function App() {
  return (
    <main style={{ width: 'min(420px, calc(100% - 32px))', margin: '0 auto', padding: '48px 0' }}>
      <BasketSummary items={[]} onIncrease={() => undefined} onDecrease={() => undefined} onRemove={() => undefined} />
    </main>
  );
}

