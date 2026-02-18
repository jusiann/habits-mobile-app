# Habits Mobile App

> Günlük alışkanlıklarınızı takip etmenizi ve hedeflerinize ulaşmanızı sağlayan mobil uygulama.

![License](https://img.shields.io/github/license/jusiann/habits-mobile-app)
![Stars](https://img.shields.io/github/stars/jusiann/habits-mobile-app?style=social)

---

## İçindekiler

- [Hakkında](#hakkında)
- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Konfigürasyon](#konfigürasyon)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [İletişim](#iletişim)

---

## Hakkında

Habits Mobile App, kullanıcıların günlük alışkanlıklarını oluşturmasını, takip etmesini ve hedeflerine ulaşmasını sağlayan kapsamlı bir mobil uygulamadır. Kullanıcı dostu arayüzü ve güçlü backend altyapısı ile kişisel gelişiminizi destekler.

**Teknoloji Yığını:**

- **Mobil:** React Native 0.81.4 + Expo 54
- **Backend:** Node.js + Express 4.21.2
- **Veritabanı:** MongoDB
- **State:** Zustand 5.0.7
- **Diğer:** Docker, i18next, JWT Authentication

---

## Özellikler

- **Alışkanlık Oluşturma** — Özelleştirilebilir alışkanlıklar tanımlama
- **Günlük Takip** — İlerlemenizi kaydedin ve görselleştirin
- **Hedef Belirleme** — Uzun vadeli hedefler oluşturma
- **Çoklu Dil Desteği** — Türkçe ve İngilizce arayüz
- **Tema Desteği** — Karanlık ve aydınlık mod
- **Takvim Görünümü** — Geçmiş günleri gözden geçirme
- **Avatar Sistemi** — Kişiselleştirilebilir profil
- **Güvenli Kimlik Doğrulama** — JWT tabanlı auth sistemi

---

## Kurulum

### Gereksinimler

- Node.js >= 18
- npm veya yarn
- Expo CLI
- MongoDB (lokal veya Atlas)
- Docker (opsiyonel)

### Hızlı Başlangıç

```bash
# Repoyu klonla
git clone https://github.com/jusiann/habits-mobile-app.git
cd habits-mobile-app

# Backend kurulumu
cd server
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm start

# Client kurulumu (yeni terminal)
cd ../client
npm install
npm start
```

### Docker ile Kurulum

```bash
# Ana dizinde
docker compose up -d
```

---

## Kullanım

### Mobil Uygulama

Expo Go uygulamasını indirin ve QR kodu tarayın veya:

```bash
# iOS simülatörde çalıştır
npm run ios

# Android emülatörde çalıştır
npm run android

# Web'de çalıştır
npm run web
```

### Uygulama Ekranları

| Ekran | Dosya | Açıklama |
|-------|-------|----------|
| Ana Sayfa | `(tabs)/index.tsx` | Günlük alışkanlıklar listesi |
| Hedefler | `(tabs)/goals.tsx` | Hedef yönetimi |
| Geçmiş | `(tabs)/history.tsx` | Geçmiş kayıtlar |
| Profil | `(tabs)/profile.tsx` | Kullanıcı ayarları |
| Alışkanlık Oluştur | `(tabs)/create.habit.tsx` | Yeni alışkanlık |
| Hedef Oluştur | `(tabs)/create.goal.tsx` | Yeni hedef |

---

## Konfigürasyon

### Backend (.env)

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | — | MongoDB bağlantı string'i |
| `JWT_SECRET` | — | JWT şifreleme anahtarı |

### Client

| Dosya | Açıklama |
|-------|----------|
| `constants/colors.js` | Renk paleti |
| `constants/theme.utils.js` | Tema ayarları |
| `locales/` | Dil dosyaları (tr.js, en.js) |

---

## API Dokümantasyonu

### Auth Endpoints

```
POST   /api/auth/register     → Yeni kullanıcı kaydı
POST   /api/auth/login        → Kullanıcı girişi
POST   /api/auth/logout       → Çıkış yap
PUT    /api/auth/profile      → Profil güncelle
POST   /api/auth/password     → Şifre değiştir
```

### Habit Endpoints

```
GET    /api/habits            → Tüm alışkanlıkları listele
POST   /api/habits            → Yeni alışkanlık oluştur
GET    /api/habits/:id        → Tek alışkanlık getir
PUT    /api/habits/:id        → Alışkanlık güncelle
DELETE /api/habits/:id        → Alışkanlık sil
POST   /api/habits/:id/log    → İlerleme kaydet
```

### Health Check

```
GET    /health                → Sistem durumu
```

---

## İletişim

**Adil Aslan** — insta:adlefee — aslanadil8@gmail.com

Proje: [https://github.com/jusiann/habits-mobile-app](https://github.com/jusiann/habits-mobile-app)