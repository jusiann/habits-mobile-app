# Habits Application

> Günlük alışkanlıklarınızı takip edin, hedefler belirleyin ve kişisel gelişiminizi ölçün.

![License](https://img.shields.io/github/license/jusiann/habits-mobile-app)
![Stars](https://img.shields.io/github/stars/jusiann/habits-mobile-app?style=social)

---

## İçindekiler

- [Hakkında](#hakkında)
- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Konfigürasyon](#konfigürasyon)
- [API Referansı](#api-referansı)
- [İletişim](#iletişim)

---

## Hakkında

Habits Application, günlük rutinlerinizi oluşturmanıza, takip etmenize ve geliştirmenize yardımcı olan full-stack bir mobil uygulamadır. Hedef belirleme, istatistik görüntüleme ve çok dilli destek ile kişisel gelişiminizi somut verilerle takip edebilirsiniz.

**Teknoloji Yığını:**

### Client
- **Dil:** TypeScript/JavaScript
- **Framework:** React Native 0.81.4 + Expo 54
- **Routing:** Expo Router 6.0
- **State:** Zustand
- **Storage:** AsyncStorage
- **Internationalization:** i18next (TR/EN)
- **UI/Charts:** React Native Calendars, Wagmi Charts
- **Diğer:** Expo Linear Gradient, Reanimated, Skia

### Server
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcryptjs
- **Security:** Express Rate Limit, CORS
- **Scheduling:** node-cron
- **Email:** Nodemailer

---

## Özellikler

### Alışkanlık Yönetimi
- **Özel Alışkanlıklar** — İstediğiniz kategori, ikon ve birimle alışkanlık oluşturun
- **Hazır Şablonlar** — Yaygın alışkanlıklar için preset'ler
- **Günlük Takip** — Her gün progress kaydedin ve görselleştirin
- **Kategoriler** — Sağlık, eğitim, üretkenlik, sosyal, wellness, diğer

### Hedef Sistemi
- **Tamamlama Hedefi** — Bir alışkanlığı X kez tamamla
- **Ulaşma Hedefi** — Belirli bir streak veya completion rate'e ulaş
- **Sürdürme Hedefi** — Mevcut başarıyı koru
- **İlerleme Takibi** — Hedeflerinize ne kadar yakın olduğunuzu görün

### İstatistik & Analitik
- **Streak Takibi** — Kesintisiz gün sayınızı görün
- **Grafik Görünümü** — Aylık ve günlük performans grafikleri
- **Completion Rate** — Başarı oranınızı yüzde olarak izleyin
- **Takvim Görünümü** — Geçmiş performansınızı takvimde görselle

### Kullanıcı Deneyimi
- **Çift Dil Desteği** — Türkçe ve İngilizce arayüz
- **Dark/Light Tema** — Otomatik tema desteği
- **Offline Cache** — İnternet olmadan da kullanım
- **Zaman Dilimi Desteği** — Dünya genelinde doğru tarih takibi
- **Güvenli Kimlik Doğrulama** — JWT tabanlı oturum yönetimi

---

## Kurulum

### Gereksinimler

- Node.js >= 18
- npm veya yarn
- MongoDB (local veya cloud)
- Expo CLI
- iOS Simulator / Android Emulator (opsiyonel)

### Hızlı Başlangıç

#### 1. Repoyu Klonlayın

```bash
git clone https://github.com/jusiann/habits-mobile-app.git
cd habits-mobile-app
```

#### 2. Server Kurulumu

```bash
cd server

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env

# .env dosyasını düzenle (MongoDB URI, JWT secret vb.)
# nano .env veya notepad .env

# Sunucuyu başlat
npm start
```

**Server .env Örneği:**

```env
MONGODB_URI=mongodb://localhost:27017/habits
JWT_SECRET=your_super_secret_key_here
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 3. Client Kurulumu

```bash
cd ../client

# Bağımlılıkları yükle
npm install

# API endpoint'ini yapılandır (constants/api.utils.js)
# Expo sunucusunu başlat
npm start
```

### Platform Komutları

```bash
# iOS simülatörde çalıştır
npm run ios

# Android emülatörde çalıştır
npm run android

# Web'de çalıştır (sınırlı destek)
npm run web
```

---

## Kullanım

### Ana Ekranlar

| Ekran | Açıklama |
|-------|----------|
| **Home** | Günlük alışkanlıklar, progress bar ve streak bilgisi |
| **Create Habit** | Yeni alışkanlık oluşturma veya preset seçimi |
| **Create Goal** | Alışkanlıklarınız için hedef belirleme |
| **Goals** | Aktif ve tamamlanmış hedefleriniz |
| **History** | Aylık/günlük istatistikler ve grafikler |
| **Detail** | Spesifik alışkanlık detayları ve düzenleme |
| **Profile** | Hesap ayarları, avatar, tema ve dil seçimi |

### Alışkanlık Oluşturma

1. Ana sayfada "+" veya "Create Habit" butonuna tıklayın
2. Hazır şablonlardan birini seçin veya özel oluşturun
3. İsim, kategori, ikon seçin
4. Hedef miktarı ve artış değerini belirleyin
5. Birim tanımlayın (adım, sayfa, dakika vb.)
6. Kaydedin ve takibe başlayın

### Hedef Belirleme

1. "Goals" sekmesinden "Create Goal" butonuna tıklayın
2. Hedef tipini seçin:
   - **Complete**: X kez tamamla (örn: 30 gün meditasyon)
   - **Reach**: Belli değere ulaş (örn: 30 günlük streak)
   - **Maintain**: Mevcut başarıyı koru
3. İlgili alışkanlığı ve hedef değerleri belirleyin
4. Kaydedin ve ilerlemeni izleyin

### Progress Kaydetme

- Ana ekranda alışkanlığınızın yanındaki "+/-" butonlarını kullanın
- Increment amount kadar artırın/azaltın
- Hedef değere ulaştığınızda otomatik tamamlanır
- Streak ve completion rate otomatik hesaplanır

---

## Konfigürasyon

### Client Yapılandırması

| Dosya | Açıklama |
|-------|----------|
| `constants/api.utils.js` | API endpoint ve request yapılandırması |
| `constants/colors.js` | Renk paleti ve tema değişkenleri |
| `constants/habit.constant.js` | Alışkanlık kategorileri ve varsayılanlar |
| `constants/theme.utils.js` | Dark/Light tema ayarları |
| `locales/tr.js`, `locales/en.js` | Çeviri dosyaları |
| `store/habit.store.js` | Zustand habit store |
| `store/auth.store.js` | Zustand authentication store |

### Server Yapılandırması

| Dosya | Açıklama |
|-------|----------|
| `.env` | Ortam değişkenleri (MongoDB, JWT, Email) |
| `src/models/` | Mongoose schema tanımları |
| `src/routes/` | API endpoint tanımları |
| `src/middlewares/auth.js` | JWT doğrulama middleware |
| `src/utils/cron.js` | Zamanlanmış görevler (günlük reset) |

### Özelleştirilebilir Değerler

| Değişken | Konum | Açıklama |
|----------|-------|----------|
| `API_BASE_URL` | `client/constants/api.utils.js` | Backend server adresi |
| `COLORS` | `client/constants/colors.js` | Uygulama renk teması |
| `categories` | `server/src/models/habit.js` | Alışkanlık kategorileri |
| `JWT_SECRET` | `server/.env` | JWT imzalama anahtarı |
| `MONGODB_URI` | `server/.env` | MongoDB bağlantı URI'si |

---

## API Referansı

### Authentication Endpoints

```
POST   /api/auth/register       - Yeni kullanıcı kaydı
POST   /api/auth/login          - Giriş yap
POST   /api/auth/logout         - Çıkış yap
POST   /api/auth/refresh        - Token yenile
POST   /api/auth/forgot-password - Şifre sıfırlama
POST   /api/auth/reset-password  - Şifre sıfırla
```

### Habit Endpoints

```
GET    /api/habits              - Tüm alışkanlıkları getir
POST   /api/habits              - Yeni alışkanlık oluştur
GET    /api/habits/:id          - Belirli alışkanlık detayı
PUT    /api/habits/:id          - Alışkanlık güncelle
DELETE /api/habits/:id          - Alışkanlık sil
POST   /api/habits/:id/log      - Progress kaydet
GET    /api/habits/:id/stats    - İstatistikleri getir
```

### Goal Endpoints

```
GET    /api/goals               - Tüm hedefleri getir
POST   /api/goals               - Yeni hedef oluştur
PUT    /api/goals/:id           - Hedef güncelle
DELETE /api/goals/:id           - Hedef sil
```

---

## İletişim

**Adil Efe** — [@adlefee](https://instagram.com/adlefee) — adilefe257@gmail.com

Proje: [https://github.com/jusiann/habits-mobile-app](https://github.com/jusiann/habits-mobile-app)

---

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.