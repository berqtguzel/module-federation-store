# Module Federation Store

[Canlı demo](https://module-federation-store-host.berqtguzel.workers.dev)

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

## Docker Compose ile tek komutla çalıştırma

Docker Desktop'ı Linux container modunda çalıştırın. Depo kökünde aşağıdaki tek komut üç uygulamayı kendi lock dosyasıyla bağımsız olarak build eder ve başlatır:

```powershell
docker compose up --build
```

| Servis | Adres | Container portu |
| --- | --- | ---: |
| Host | `http://localhost:3100` | 3100 |
| Products Remote | `http://localhost:3101` | 3101 |
| Basket Remote | `http://localhost:3102` | 3102 |

Compose, Host image build'ine `PRODUCTS_REMOTE_URL=http://localhost:3101` ve `BASKET_REMOTE_URL=http://localhost:3102` argümanlarını verir. Remote dosyalarını container değil kullanıcının tarayıcısı istediği için istemci bundle'ında `products` veya `basket` gibi Docker servis adları kullanılmaz. Fake Store API adresi gerekirse build öncesinde `$env:NEXT_PUBLIC_FAKE_STORE_API_URL = 'https://api.example.com'` ile değiştirilebilir.

Doğrulama için Host'u açın ve tarayıcı geliştirici araçlarında şunları kontrol edin:

1. Products kataloğunda gerçek ürünler görünür.
2. `http://localhost:3101/_next/static/chunks/remoteEntry.js` ve `http://localhost:3102/remoteEntry.js` istekleri ile bunların chunk istekleri başarılıdır.
3. Bir ürünü sepete ekleme, adedi artırma/azaltma ve ürünü silme işlemleri çalışır.
4. Products ve Basket adresleri Host'tan bağımsız olarak container dışından açılır.

Servisleri ve Compose ağını kapatmak için:

```powershell
docker compose down
```

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

## Debug çalıştırma

Node.js inspector ile debug için her uygulamayı ayrı PowerShell terminalinde, çakışmayan bir inspector portuyla başlatın:

```powershell
Set-Location apps/host
$env:NEXT_PRIVATE_LOCAL_WEBPACK = 'true'
node --inspect=9230 .\node_modules\next\dist\bin\next dev -p 3100
```

```powershell
Set-Location apps/products
$env:NEXT_PRIVATE_LOCAL_WEBPACK = 'true'
node --inspect=9231 .\node_modules\next\dist\bin\next dev -p 3101
```

```powershell
Set-Location apps/basket
node --inspect=9232 .\node_modules\webpack-cli\bin\cli.js serve --mode development --port 3102
```

Next.js inspector oturumlarından sonra `Remove-Item Env:NEXT_PRIVATE_LOCAL_WEBPACK` ile geçici değişkeni temizleyin. Development ve debug süreçleri ön planda çalışır; `Ctrl+C` işlemi sonlandırır ve bağlı portu serbest bırakır. Next.js, Webpack Dev Server ve `serve` erişim/derleme loglarını dosyaya değil standart çıktı ve standart hata akışlarına yazar.

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

Products içindeki [`productsApi`](apps/products/api/productsApi.ts), `createApi` ve `fetchBaseQuery` ile `/products` çağrısını tanımlar. `keepUnusedDataFor: 300`, sorgunun son abonesi ayrıldıktan sonra kullanılmayan cache verisinin 300 saniye daha saklanacağı anlamına gelir; aktif abonelik varken başlayan sabit bir “veri geçerlilik süresi” değildir. [`productsStore`](apps/products/store/productsStore.ts) modül seviyesinde bir kez oluşturulduğu için her render'da yeni store kurulmaz. Host ürünleri ayrıca istemez; sorgu yalnız Products Remote içinde yapılır.

[`withProductQuery`](apps/products/components/catalog/withProductQuery.tsx) HOC'u loading, API hatası, tekrar deneme ve boş liste durumlarını sorgudan ayırır. Başarılı veriyi yalnızca sunum sorumluluğu taşıyan `ProductCatalogView` bileşenine geçirir.

[`Host ana sayfası`](apps/host/pages/index.tsx), sepeti `BasketItem[]` olarak bellekte tutar. Products Remote'a tipli `onAddToBasket(product)` callback'i verilir; aynı ürün yeniden eklenirse adet artar. Host, Basket Remote'a `items`, `onIncrease`, `onDecrease` ve `onRemove` props'larını geçirir. Basket Remote yalnız bu dar, tipli arayüzü kullanır ve ürün API'sine ikinci bir istek yapmaz. Sepet backend'e veya tarayıcı depolamasına yazılmadığından sayfa yenilendiğinde sıfırlanması beklenen davranıştır.

## Tasarım referansı

Tasarım yönü, Word Case Study ile paylaşılan Ant Design/Figma mağaza ve “Shopping Carts” ekran görüntülerinden ve [Ant for Figma E-commerce Template](https://www.antforfigma.com/templates/e-commerce-template) genel önizlemesinden alınmıştır. “Preview template in Figma” bağlantısı `ogRzeQinLycCRFKjUN9ZXo` dosyasının `317:21821` node'una yönlense de doğrudan Figma embed'i erişim sırasında 403 verdi; bu nedenle erişilemeyen frame'lerle piksel düzeyinde eşleşme iddia edilmez.

- Tipografi, SF Pro Text görünümüne yaklaşan native sistem font dizisini kullanır. “Ürünler” başlığı masaüstünde 38 px/600, ürün adı 16 px, gövde 14 px ve ikincil bilgi 12 px olarak düzenlendi. İnce beyaz navbar, Ant Design mavisi işlemler ve toplam adet rozeti görsel hiyerarşiyi tamamlar.
- Ürün kartlarında beyaz yüzey, açık gri ince kenarlık, hafif gölge ve hizalı görsel alanı kullanılır. İki satırla sınırlanan uzun adlar fiyat ile “Sepete ekle” düğmesinin kartlar arasında aynı hizada kalmasını sağlar.
- Sepet satırı, referanstaki gibi solda küçük görsel, ortada ürün adı/birim fiyat/adet kontrolleri, sağda satır tutarı ve “Sil” işlemi olacak şekilde bölünür. İnce ayırıcılar kullanılır; ara toplam panelin altında görünür kalır. Referansta bulunan checkout, stok, kargo, beden ve renk alanları case study kapsamına alınmadı.
- 1080 px üzerindeki iki kolonlu masaüstü düzende sepet paneli navbar altında 78 px boşlukla sticky kalır. Sepet ekran yüksekliğini aşarsa yalnız ürün listesi kayar ve toplam görünür kalır. 1080 px ve altında katalog ile sepet tek kolona geçer; sepet `position: static` ile normal belge akışında kataloğun altına yerleşir. Bu karar dar ekranda kullanılabilir alanı korur ve iç içe kaydırma/yatay taşma riskini azaltır.

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
| VIII. Concurrency | Kısmen | Üç uygulama bağımsız süreç ve artefakt olarak ayrı ayrı çoğaltılabilir; istemci tarafındaki sepet sunucu instance state'ine bağlı değildir. Doğrulama tek Host ve tek remote instance ile yapıldı; çoklu replica, load balancer ve yatay ölçek yük testi yapılmadı. |
| IX. Disposability | Kısmen | Development ve production süreçlerinin ön planda başladığı, log ürettiği ve `Ctrl+C` ile kapanıp portlarını serbest bıraktığı doğrulandı. Remote kesintisi Host'u düşürmez; ancak özel signal/graceful shutdown kodu ve health-check yoktur. |
| X. Dev/prod parity | Kısmen | Aynı lock dosyaları, ortam değişkenleri ve Federation sözleşmeleriyle development sunucuları ile production build/start akışları yerelde çalıştırıldı. Next.js dev sunucusu ile optimize `.next`, ayrıca Webpack Dev Server ile statik `dist` sunumu farklıdır; container veya production altyapısı olmadığı için tam ortam eşitliği doğrulanmadı. |
| XI. Logs | Kısmen | Host, Products ve Basket süreçlerinin başlangıç, derleme ve HTTP erişim loglarını standart çıktı/standart hataya yazdığı doğrulandı. Uygulama log dosyası tutmaz; merkezi toplama, yapılandırılmış log, metric ve tracing yoktur. |
| XII. Admin processes | Eksik | Migration veya tek seferlik yönetim işi bulunmadığı için admin process akışı tanımlanmamıştır. |

## Teslim doğrulaması

16 Kasım 2026 tarihinde `test/v1.0.0` dalının `d9cf23d2353c179ae8cf781ca29d6ae980ad629e` commit'i ayrı bir geçici dizine klonlandı. Üç uygulamada birbirinden bağımsız `npm ci`, `npm run typecheck` ve `npm run build` komutları `exit 0` ile tamamlandı.

Production sunucuları yukarıdaki `npm start` komutlarıyla açılarak headless Chrome 157 üzerinde doğrulandı:

- Products ve Basket remote entry istekleri birer kez 200 döndü; her iki remote'un gerekli ikişer chunk isteği başarılı oldu.
- Fake Store `/products` isteği normal açılışta bir kez 200 döndü ve 20 gerçek ürün gösterildi.
- İlk ürün eklendiğinde adet `1`, toplam `$109,95`; artırıldığında adet `2`, toplam `$219,90`; azaltıldığında yeniden `1` ve `$109,95` oldu. Silme sonrası boş sepet gösterildi.
- 1440 × 800 emülasyonda katalog kaydırılırken sepet paneli navbar altında sticky kaldı; uzun sepette yalnız ürün listesi kaydı ve ara toplam görünür kaldı.
- 390 × 844 emülasyonda sepet normal belge akışına geçti, document genişliği 390 px kaldı ve yatay taşma oluşmadı.
- Basket sunucusu durdurulduğunda Host başlığı ve 20 ürün görünmeye devam etti; Basket alanında “Sepet şu anda kullanılamıyor” fallback'i gösterildi.
- Tarayıcı konsolunda hata gözlenmedi.

17 Kasım 2026 tarihinde son responsive dokümantasyon düzenlemelerinden sonra üç uygulamanın `npm run typecheck` ve `npm run build` komutları yeniden başarıyla tamamlandı. Development süreçleri izole 4200–4202 portlarında başlatıldı; başlangıç, derleme ve HTTP loglarının standart çıktıda olduğu, ardından `Ctrl+C` ile kapandıkları ve portları serbest bıraktıkları doğrulandı.

Basket production build'i başarılıdır ancak Webpack asset-size uyarısı sürmektedir: `967.35b660a7731484635f01.js` adlı `vendors` chunk'ı 514 KiB'dir; önerilen 244 KiB sınırını aşar. Bu işlevsel hata değildir, fakat Ant Design tarafında bileşen/stil bazlı ayrıştırma ve bundle analiziyle ayrıca ele alınmalıdır.

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
