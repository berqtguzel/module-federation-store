import React from 'react';
import BasketSummary from './BasketSummary';

export default function App() {
  return (
    <main style={{ width: 'min(720px, calc(100% - 32px))', margin: '0 auto', padding: '64px 0' }}>
      <h1>Basket uygulaması</h1>
      <BasketSummary />
    </main>
  );
}

