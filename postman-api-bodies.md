# Postman API Documentation - Request Bodies

## 🔐 AUTH ENDPOINTS

### 1. Sign Up
**POST** `http://localhost:3000/api/auth/sign-up`
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "fullname": "Test User",
    "password": "Test123!",
    "gender": "male",
    "height": 175,
    "weight": 70
}
```

### 2. Sign In
**POST** `http://localhost:3000/api/auth/sign-in`
```json
{
    "usernameOrEmail": "testuser",
    "password": "Test123!"
}
```

### 3. Refresh Token
**POST** `http://localhost:3000/api/auth/refresh-token`
```json
{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Forgot Password
**POST** `http://localhost:3000/api/auth/forgot-password`
```json
{
    "email": "test@example.com"
}
```

### 5. Check Reset Token
**POST** `http://localhost:3000/api/auth/check-reset-token`
```json
{
    "email": "test@example.com",
    "resetCode": "123456"
}
```

### 6. Change Password (Reset)
**POST** `http://localhost:3000/api/auth/change-password`
```json
{
    "email": "test@example.com",
    "resetCode": "123456",
    "newPassword": "NewPass123!"
}
```

### 7. Change Password (Authenticated)
**POST** `http://localhost:3000/api/auth/change-password-auth`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
```json
{
    "currentPassword": "Test123!",
    "newPassword": "NewPass123!"
}
```

### 8. Edit Profile
**POST** `http://localhost:3000/api/auth/edit-profile`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
```json
{
    "fullname": "Updated Name",
    "gender": "female",
    "height": 165,
    "weight": 60,
    "profilePicture": "https://example.com/profile.jpg"
}
```

### 9. Logout
**POST** `http://localhost:3000/api/auth/logout`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
```json
{}
```

---

## 🎯 HABIT ENDPOINTS

### 1. Get Dashboard
**GET** `http://localhost:3000/api/habits/dashboard`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
**Body:** None (GET request)

### 2. Add Habit
**POST** `http://localhost:3000/api/habits`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

**Custom Habit:**
```json
{
    "name": "Water Drinking",
    "type": "custom",
    "category": "health",
    "icon": "💧",
    "unit": "glasses",
    "targetAmount": 8,
    "incrementAmount": 1,
    "availableUnits": ["glasses", "liters", "cups"]
}
```

**From Preset:**
```json
{
    "name": "Reading",
    "type": "preset",
    "category": "education",
    "icon": "📚",
    "unit": "pages",
    "targetAmount": 20,
    "incrementAmount": 5,
    "availableUnits": ["pages", "minutes", "chapters"]
}
```

### 3. Get Habit Detail
**GET** `http://localhost:3000/api/habits/detail/HABIT_ID`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
**Body:** None (GET request)

### 4. Update Habit
**PUT** `http://localhost:3000/api/habits/HABIT_ID`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
```json
{
    "name": "Updated Water Drinking",
    "category": "wellness",
    "icon": "🚰",
    "unit": "liters",
    "targetAmount": 3,
    "incrementAmount": 0.5
}
```

### 5. Delete Habit
**DELETE** `http://localhost:3000/api/habits/HABIT_ID`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
**Body:** None

### 7. Get Habit Presets
**GET** `http://localhost:3000/api/habits/presets`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
**Body:** None (GET request)

### 6. Increment Habit
**POST** `http://localhost:3000/api/habits/HABIT_ID/increment`
**Headers:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
**Body:** None (uses habit's incrementAmount)

---

## 📝 SAMPLE TEST SCENARIOS

### Scenario 1: Complete User Journey
1. **Sign Up** → Get user created
2. **Sign In** → Get access + refresh tokens
3. **Add Habit** → Create a water habit
4. **Get Dashboard** → See the habit
5. **Increment Habit** → Add progress
6. **Get Dashboard** → See updated progress

### Scenario 2: Auth Flow Testing
1. **Sign In** → Get tokens
2. **Edit Profile** → Update user info
3. **Change Password Auth** → Change password
4. **Refresh Token** → Get new access token
5. **Logout** → End session

### Scenario 3: Password Reset Flow
1. **Forgot Password** → Request reset
2. **Check Reset Token** → Verify code
3. **Change Password** → Reset password
4. **Sign In** → Login with new password

---

## 🔧 POSTMAN ENVIRONMENT VARIABLES

Create these variables in Postman:
```
baseUrl: http://localhost:3000/api
accessToken: (will be set after sign-in)
refreshToken: (will be set after sign-in)
userId: (will be set after sign-in)
habitId: (will be set after creating habit)
```

### Auto-Set Token Script (Add to Sign-In Tests tab):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.accessToken);
    pm.environment.set("refreshToken", response.refreshToken);
    pm.environment.set("userId", response.user._id);
}
```

---

## ⚡ QUICK TEST BODIES

### Minimal Sign Up:
```json
{
    "username": "test123",
    "email": "test123@test.com",
    "fullname": "Test User",
    "password": "Test123!"
}
```

### Minimal Habit:
```json
{
    "name": "Reading",
    "category": "education",
    "targetAmount": 30,
    "incrementAmount": 5
}
```

### Quick Increment:
```json
{
    "incrementValue": 1
}
```
