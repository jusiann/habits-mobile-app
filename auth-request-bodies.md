# AUTH ENDPOINTS - Request Bodies & Required Fields

## 🔐 Authentication Request Bodies

### 1. **Sign Up**
**POST** `/auth/sign-up`
```json
{
    "username": "testuser123",
    "email": "test@example.com", 
    "fullname": "Test User",
    "password": "Test123!",
    "gender": "male",           // Optional: "male", "female", "other"
    "height": 175,              // Optional: number (cm)
    "weight": 70                // Optional: number (kg)
}
```
**Required Fields:** `username`, `email`, `fullname`, `password`
**Optional Fields:** `gender`, `height`, `weight`

---

### 2. **Sign In**
**POST** `/auth/sign-in`
```json
{
    "username": "testuser123",     // Either username OR email required
    "email": "test@example.com",   // Either username OR email required  
    "password": "Test123!"         // Required
}
```
**Required:** Either `username` OR `email` + `password`

---

### 3. **Refresh Token**
**POST** `/auth/refresh-token`
```json
{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Required:** `refreshToken` in body

---

### 4. **Forgot Password**
**POST** `/auth/forgot-password`
```json
{
    "email": "test@example.com"   // Required
}
```
**Required:** `email`

---

### 5. **Check Reset Token**
**POST** `/auth/check-reset-token`
```json
{
    "resetCode": "A1B2C3"        // Required - 6 char code from email
}
```
**Required:** `resetCode` only
**Returns:** `temporaryToken` + `email` for next step

---

### 6. **Change Password (Reset)**
**POST** `/auth/change-password`
```json
{
    "password": "NewPass123!",             // Required - new password
    "temporaryToken": "eyJhbGci..."        // Required - from check-reset-token
}
```
**Required:** `password`, `temporaryToken`
**Note:** Email artık temporaryToken'dan alınıyor

---

### 7. **Change Password (Authenticated)**
**POST** `/auth/change-password-auth`
**Headers:** `Authorization: Bearer ACCESS_TOKEN`
```json
{
    "currentPassword": "Test123!",     // Required
    "newPassword": "NewPass123!"       // Required
}
```
**Required:** `currentPassword`, `newPassword`

---

### 8. **Edit Profile**
**POST** `/auth/edit-profile`
**Headers:** `Authorization: Bearer ACCESS_TOKEN`
```json
{
    "fullname": "Updated Name",                    // Optional
    "gender": "female",                           // Optional: "male", "female", "other"
    "height": 165,                                // Optional: 0-300 cm
    "weight": 60,                                 // Optional: 0-500 kg
    "profilePicture": "https://example.com/pic"   // Optional: URL
}
```
**Required:** En az bir field gönderilmeli
**Note:** `username` ve `email` değiştirilemez!

---

### 9. **Logout**
**POST** `/auth/logout`
**Headers:** `Authorization: Bearer ACCESS_TOKEN`
```json
{}
```
**Body:** Empty - Sadece access token invalidate edilir

---

## 📝 **Important Notes:**

### **Field Validations:**
- **fullname:** Minimum 2 karakter
- **gender:** Sadece "male", "female", "other"
- **height:** 0-300 cm arası
- **weight:** 0-500 kg arası
- **password:** Minimum 8 karakter (controller'da validation yok ama önerilen)

### **Headers for Protected Routes:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### **Response Format (All endpoints):**
```json
{
    "success": true/false,
    "message": "Success/error message",
    "accessToken": "...",        // Only in sign-in, sign-up, refresh
    "refreshToken": "...",       // Only in sign-in, sign-up, refresh
    "user": { ... },             // User data when applicable
    "temporaryToken": "..."      // Only in check-reset-token
}
```

---

## 🚀 **Quick Test Examples:**

### **Minimal Sign Up:**
```json
{
    "username": "test123",
    "email": "test123@test.com", 
    "fullname": "Test User",
    "password": "12345678"
}
```

### **Sign In with Username:**
```json
{
    "username": "test123",
    "password": "12345678"
}
```

### **Sign In with Email:**
```json
{
    "email": "test123@test.com",
    "password": "12345678"
}
```

### **Profile Update:**
```json
{
    "fullname": "New Name",
    "height": 180
}
```
