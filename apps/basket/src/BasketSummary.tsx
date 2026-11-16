import React from 'react';

const cardStyle: React.CSSProperties = {
  minHeight: 230,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: 28,
  border: '1px solid #d5d8dc',
  borderRadius: 22,
  color: '#17202a',
  background: '#ffffff',
  boxShadow: '0 18px 45px rgba(23, 32, 42, 0.08)'
};

export default function BasketSummary() {
  return (
    <article style={cardStyle} data-testid="basket-remote">
      <div>
        <span style={{ color: '#b03a2e', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Basket remote
        </span>
        <h2 style={{ margin: '18px 0 8px', fontSize: 30 }}>Örnek sepet alanı</h2>
        <p style={{ margin: 0, lineHeight: 1.6, color: '#566573' }}>
          Bu bileşen 3102 portundaki bağımsız Webpack uygulamasından geliyor.
        </p>
      </div>
      <strong>remoteEntry.js üzerinden yüklendi</strong>
    </article>
  );
}

