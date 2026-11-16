const cardStyle = {
  minHeight: 230,
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'space-between',
  padding: 28,
  borderRadius: 22,
  color: '#f8f9f9',
  background: 'linear-gradient(145deg, #146c5b, #0b5345)',
  boxShadow: '0 18px 45px rgba(20, 108, 91, 0.2)'
};

export default function ProductCard() {
  return (
    <article style={cardStyle} data-testid="products-remote">
      <div>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Products remote
        </span>
        <h2 style={{ margin: '18px 0 8px', fontSize: 30 }}>Örnek ürün alanı</h2>
        <p style={{ margin: 0, lineHeight: 1.6, color: '#d5f5e3' }}>
          Bu bileşen 3101 portundaki Next.js uygulamasından geliyor.
        </p>
      </div>
      <strong>remoteEntry.js üzerinden yüklendi</strong>
    </article>
  );
}

