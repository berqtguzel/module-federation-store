# Module Federation Store

Word Frontend Developer Case Study için hazırlanmış, üç bağımsız uygulamadan oluşan mikro frontend mağaza örneğidir. Kaynak kod: [github.com/berqtguzel/module-federation-store](https://github.com/berqtguzel/module-federation-store).

## Mimari

| Uygulama | Teknoloji | Port | Sorumluluk |
| --- | --- | ---: | --- |
| Host | Next.js 15, Pages Router, TypeScript | 3100 | Sayfa kabuğunu ve sepet state'ini yönetir; iki remote'u çalışma zamanında yükler. |
| Products Remote | Next.js 15, RTK Query, Ant Design | 3101 | Fake Store API'den ürünleri alır, sorgu durumlarını yönetir ve ürün kataloğunu expose eder. |
| Basket Remote | React 18, Webpack 5, Ant Design | 3102 | Host'un props ile verdiği sepeti gösterir; adet ve silme callback'lerini çağırır. API isteği yapmaz. |

Host, Products için `http://localhost:3101/_next/static/chunks/remoteEntry.js`, Basket için `http://localhost:3102/remoteEntry.js` dosyasını yükler. Remote'lardan biri erişilemezse onun yerine hata mesajı gösterilir; Host ve diğer remote çalışmayı sürdürür.

Sabitlenmiş temel sürümler: Next.js `15.5.29`, React/React DOM `18.3.1`, Webpack `5.101.3`, `@module-federation/nextjs-mf` `8.9.0`, Ant Design `5.29.3`, Redux Toolkit `2.14.0` ve TypeScript `5.9.3`. Host ve Products, Next.js'in geçişli PostCSS bağımlılığını güvenli `8.5.23` sürümüne sabitler.

## Gereksinimler

- Windows ve PowerShell
- Git
- Next.js paket tanımına göre Node.js `^18.18.0 || ^19.8.0 || >=20.0.0`; teslim için güncel bir Node.js LTS sürümü ve npm `>=10` önerilir.
- Doğrulanan ortam: Node.js `24.14.1`, npm `11.11.0`, Windows.

Depo kökünde ortak bir npm workspace yoktur. Her uygulamanın kendi `package.json` ve `package-lock.json` dosyası vardır; kurulum ve komutlar uygulama dizininde çalıştırılır.

## Kurulum

```powershell
git clone https://github.com/berqtguzel/module-federation-store.git
Set-Location module-federation-store
git switch test/v1.0.0

Push-Location apps/host
npm ci
Pop-Location

Push-Location apps/products
npm ci
Pop-Location

Push-Location apps/basket
npm ci
Pop-Location
```

`npm ci`, ilgili uygulamadaki lock dosyasını değiştirmeden temiz ve tekrarlanabilir kurulum yapar.

## Ortam değişkenleri

| Uygulama | Değişken | Yerel varsayılan | Açıklama |
| --- | --- | --- | --- |
| Host | `PRODUCTS_REMOTE_URL` | `http://localhost:3101` | Products origin'i; sonunda `/` kullanmayın. |
| Host | `BASKET_REMOTE_URL` | `http://localhost:3102` | Basket origin'i; sonunda `/` kullanmayın. |
| Products | `NEXT_PUBLIC_FAKE_STORE_API_URL` | `https://fakestoreapi.com` | Ürün API'sinin base URL'i. |
| Basket | — | — | Ortam değişkeni yoktur. |

Yerel dosyaları PowerShell ile hazırlamak için:

```powershell
Copy-Item apps/host/.env.example apps/host/.env.local
Copy-Item apps/products/.env.example apps/products/.env.local
```

`.env.local` dosyaları Git'e alınmaz. `PRODUCTS_REMOTE_URL`, `BASKET_REMOTE_URL` ve `NEXT_PUBLIC_` değişkeni istemci bundle'ına build sırasında yazılır; production değerleri `npm run build` çalıştırılmadan önce verilmelidir. Bunlar gizli bilgi taşımamalıdır.

## Development çalıştırma

Üç ayrı PowerShell terminali açın:

```powershell
Set-Location apps/products
npm run dev
```

```powershell
Set-Location apps/basket
npm run dev
```

```powershell
Set-Location apps/host
npm run dev
```

Ardından Host'u `http://localhost:3100` adresinde açın. Products tek başına `http://localhost:3101`, Basket'in boş sepet standalone görünümü `http://localhost:3102` adresindedir.

## Production build ve yerel servis

Her uygulamayı kendi dizininde build edin:

```powershell
Push-Location apps/products
npm run typecheck
npm run build
Pop-Location

Push-Location apps/basket
npm run typecheck
npm run build
Pop-Location

Push-Location apps/host
npm run typecheck
npm run build
Pop-Location
```

Buildlerden sonra üç ayrı PowerShell terminalinde:

```powershell
Set-Location apps/products
npm start
```

```powershell
Set-Location apps/basket
npm start
```

```powershell
Set-Location apps/host
npm start
```

`npm start`, Next.js uygulamalarını sırasıyla 3100/3101 portlarında; Basket'in statik `dist` çıktısını 3102 portunda servis eder.

## Dağıtım

Üç uygulama bağımsız artefakt ve servis olarak dağıtılır. Önce iki remote, sonra onların herkese açık HTTPS origin'leri verilerek Host build edilmelidir:

```powershell
# Products artefaktı
Set-Location apps/products
npm ci
$env:NEXT_PUBLIC_FAKE_STORE_API_URL = 'https://api.example.com'
npm run build

# Basket artefaktı
Set-Location ..\basket
npm ci
npm run build

# Host artefaktı; remote origin'leri build öncesi zorunludur
Set-Location ..\host
npm ci
$env:PRODUCTS_REMOTE_URL = 'https://products.example.com'
$env:BASKET_REMOTE_URL = 'https://basket.example.com'
npm run build
```

- Host ve Products, kendi `.next` çıktıları ve production bağımlılıklarıyla ayrı Node.js servislerinde çalıştırılır.
- Basket'in `dist` dizini statik bir web sunucusu/CDN ile servis edilir. `remoteEntry.js` ve content-hash'li chunk dosyaları aynı origin'den erişilebilir olmalıdır.
- Host'un build sırasında aldığı remote URL'leri tarayıcıdan erişilebilir olmalıdır. URL değişirse Host yeniden build edilmelidir.
- Remote origin'leri bağımsız ölçeklenebilir ve dağıtılabilir; bir remote kesintisi diğerini durdurmaz.

## Veri ve bileşen akışı

Products içindeki [`productsApi`](apps/products/api/productsApi.ts), `createApi` ve `fetchBaseQuery` ile `/products` çağrısını tanımlar. RTK Query başarılı sonucu 300 saniye (`keepUnusedDataFor`) önbellekte tutar. [`productsStore`](apps/products/store/productsStore.ts) modül seviyesinde bir kez oluşturulduğu için her render'da yeni store kurulmaz. Host ürünleri ayrıca istemez; sorgu yalnız Products Remote içinde yapılır.

[`withProductQuery`](apps/products/components/catalog/withProductQuery.tsx) HOC'u loading, API hatası, tekrar deneme ve boş liste durumlarını sorgudan ayırır. Başarılı veriyi yalnızca sunum sorumluluğu taşıyan `ProductCatalogView` bileşenine geçirir.

[`Host ana sayfası`](apps/host/pages/index.tsx), sepeti `BasketItem[]` olarak bellekte tutar. Products Remote'a tipli `onAddToBasket(product)` callback'i verilir; aynı ürün yeniden eklenirse adet artar. Host, Basket Remote'a `items`, `onIncrease`, `onDecrease` ve `onRemove` props'larını geçirir. Basket Remote yalnız bu dar, tipli arayüzü kullanır ve ürün API'sine ikinci bir istek yapmaz. Sepet backend'e veya tarayıcı depolamasına yazılmadığından sayfa yenilendiğinde sıfırlanması beklenen davranıştır.

## Tasarım referansı

Referans, [Ant for Figma E-commerce Template](https://www.antforfigma.com/templates/e-commerce-template) sayfasıdır. Sayfadaki “Preview template in Figma” bağlantısı `ogRzeQinLycCRFKjUN9ZXo` dosyasının `317:21821` node'una yönlenmektedir. Doğrudan Figma embed'i erişim sırasında 403 verdiği için birebir Figma incelemesi yapılamadı. Herkese açık Ant for Figma sayfasında masaüstü “Shop by Collection” ve “Beard Oil Pro” ürün detay görselleri doğrulandı; ürün listeleme frame'i ve mobil Figma frame'i doğrulanamadı. Bu nedenle uygulama Ant Design'ın grid, kart, tipografi ve responsive ilkelerini referans alır; erişilemeyen ekranlarla piksel düzeyinde eşleşme iddia edilmez.

## SOLID değerlendirmesi

| İlke | Durum | Somut karşılık / eksik |
| --- | --- | --- |
| Tek Sorumluluk | Karşılanıyor | API slice, store, sorgu durumlarını yöneten HOC, katalog görünümü, Host state'i ve Basket sunumu ayrı dosyalardadır. |
| Açık/Kapalı | Kısmen | Remote bileşenler tipli props ve Federation modülüyle değiştirilebilir. Yeni sepet davranışları için Host reducer/domain katmanı bulunmadığından ana sayfa değişebilir. |
| Liskov Yerine Geçme | Doğrudan uygulanmıyor | Kalıtım hiyerarşisi yoktur. Remote modülleri aynı beklenen React component sözleşmesini sağlamalıdır ancak çalışma zamanı şema doğrulaması yoktur. |
| Arayüz Ayrımı | Karşılanıyor | Products yalnız `onAddToBasket`; Basket yalnız öğeler ve üç güncelleme callback'i alır. Remote'lara gereksiz Host bağımlılığı taşınmaz. |
| Bağımlılığın Tersine Çevrilmesi | Kısmen | Host somut kaynak dosyaları yerine remote component sözleşmelerine bağlıdır. Buna karşılık Fake Store transport'u ve iki tarafta yinelenen TypeScript tipleri ortak, sürümlenmiş bir contract paketiyle soyutlanmamıştır. |

## Twelve-Factor değerlendirmesi

| Faktör | Durum | Değerlendirme |
| --- | --- | --- |
| I. Codebase | Karşılanıyor | Tek Git deposu üç ayrı deploy edilebilir uygulamayı izler. |
| II. Dependencies | Karşılanıyor | Her uygulama bağımlılıklarını kendi `package.json` ve lock dosyasında açıkça tanımlar; `npm ci` kullanılır. |
| III. Config | Kısmen | API ve remote origin'leri ortam değişkenidir. Değerler build-time istemci config'idir; merkezi secret/runtime config yönetimi yoktur. |
| IV. Backing services | Karşılanıyor | Fake Store API değiştirilebilir base URL ile bağlı bir servis olarak ele alınır. |
| V. Build, release, run | Kısmen | `build` ve `start` aşamaları ayrıdır. Sürümlü artefakt/release otomasyonu ve CI/CD tanımı yoktur. |
| VI. Processes | Karşılanıyor | Uygulama süreçleri kalıcı yerel state'e dayanmaz. Sepetin yenilemede sıfırlanması bunun bilinçli sonucudur. |
| VII. Port binding | Karşılanıyor | Üç uygulama 3100, 3101 ve 3102 portlarından kendini servis eder. |
| VIII. Concurrency | Eksik | Yatay ölçekleme ve süreç modeli bu case study kapsamında tanımlanmadı/test edilmedi. |
| IX. Disposability | Kısmen | Remote kesintisi Host'u düşürmez ve süreçler hızlı başlar; özel graceful shutdown/health-check yoktur. |
| X. Dev/prod parity | Kısmen | Aynı lock dosyaları ve Federation yapısı kullanılır; container/altyapı tanımı olmadığı için ortam eşitliği garanti edilmez. |
| XI. Logs | Eksik | Yapılandırılmış merkezi log, metric ve tracing yoktur. |
| XII. Admin processes | Eksik | Migration veya tek seferlik yönetim işi bulunmadığı için admin process akışı tanımlanmamıştır. |

## Teslim doğrulaması

16 Kasım 2026 tarihinde `test/v1.0.0` dalının `d9cf23d2353c179ae8cf781ca29d6ae980ad629e` commit'i ayrı bir geçici dizine klonlandı. Üç uygulamada birbirinden bağımsız `npm ci`, `npm run typecheck` ve `npm run build` komutları `exit 0` ile tamamlandı.

Production sunucuları yukarıdaki `npm start` komutlarıyla açılarak headless Chrome 157 üzerinde doğrulandı:

- Products ve Basket remote entry istekleri birer kez 200 döndü; her iki remote'un gerekli ikişer chunk isteği başarılı oldu.
- Fake Store `/products` isteği normal açılışta bir kez 200 döndü ve 20 gerçek ürün gösterildi.
- İlk ürün eklendiğinde adet `1`, toplam `$109,95`; artırıldığında adet `2`, toplam `$219,90`; azaltıldığında yeniden `1` ve `$109,95` oldu. Silme sonrası boş sepet gösterildi.
- 390 × 844 emülasyonda document genişliği 390 px kaldı; yatay taşma oluşmadı.
- Basket sunucusu durdurulduğunda Host başlığı ve 20 ürün görünmeye devam etti; Basket alanında “Sepet şu anda kullanılamıyor” fallback'i gösterildi.
- Tarayıcı konsolunda hata gözlenmedi.

Basket production build'i başarılıdır ancak Webpack asset-size uyarısı sürmektedir: `142.ca60ed001b2a95ea519e.js` adlı `vendors` chunk'ı 519 KiB'dir; önerilen 244 KiB sınırını aşar. Bu işlevsel hata değildir, fakat Ant Design tarafında bileşen/stil bazlı ayrıştırma ve bundle analiziyle ayrıca ele alınmalıdır.

## Güvenlik denetimi

Aynı temiz kopyada 16 Kasım 2026 tarihinde her uygulama için hem `npm audit` hem `npm audit --omit=dev` çalıştırıldı. `npm audit fix` ve `--force` çalıştırılmadı; bağımlılık değiştirilmedi.

Host ve Products sonuçları aynıdır; 16 bulgunun tamamı production bağımlılık ağacında da görünür: 1 düşük, 2 orta, 12 yüksek, 1 kritik.

| Paket(ler) | Önem | Bağlantı | Kapsam |
| --- | --- | --- | --- |
| `next` | Kritik | Doğrudan | Production |
| `@module-federation/nextjs-mf` | Yüksek | Doğrudan | Production |
| `@module-federation/cli`, `dts-plugin`, `enhanced`, `manifest`, `node`, `rspack` | Yüksek | Geçişli | Production |
| `adm-zip`, `koa`, `ws` | Yüksek | Federation üzerinden geçişli | Production |
| `postcss`, `sharp` | Yüksek | Next.js üzerinden geçişli | Production |
| `@modern-js/node-bundle-require`, `esbuild` | Orta | Federation üzerinden geçişli | Production |
| `webpack` | Düşük | Doğrudan | Production |

Basket için tam audit 4 bulgu verdi: 1 düşük, 3 orta. `npm audit --omit=dev` sonucu sıfırdır; tümü geliştirme/build kapsamındadır.

| Paket | Önem | Bağlantı | Kapsam |
| --- | --- | --- | --- |
| `webpack-dev-server` | Orta | Doğrudan | Development |
| `sockjs`, `uuid` | Orta | Geçişli | Development |
| `webpack` | Düşük | Doğrudan | Development/build |

17 Kasım 2026 tarihinde Host ve Products, Next.js `15.5.29`, `@module-federation/nextjs-mf` `8.9.0` ve PostCSS override `8.5.23` sürümlerine güncellendi. `npm audit fix` ve `--force` kullanılmadı. Temiz kurulum, üç uygulamanın typecheck/build kontrolleri ve production Federation/sepet/fallback akışları yeniden doğrulandı. Güncelleme sonrasında Host ve Products için `npm audit --omit=dev` sonucu yalnız Webpack `5.101.3` kaynaklı 1 düşük bulgudur; kritik, yüksek ve orta bulgu kalmamıştır. Audit'in düşük bulgu için önerdiği Webpack `5.112.2`, bu güvenlik düzeltmesinin kritik/yüksek kapsamını büyütmemek amacıyla uygulanmadı.
