# HABIT ENDPOINTS - Postman Examples

## 🎯 Habit Management Endpoints

### 1. **Get Dashboard**
**GET** `http://localhost:3000/api/habits/dashboard`
**Headers:** 
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
**Body:** None (GET request)

**Response Example:**
```json
{
    "success": true,
    "message": "Dashboard data retrieved successfully",
    "data": {
        "habits": [
            {
                "id": "6507f1f4b0c6d700123456789",
                "name": "Water Drinking",
                "category": "health",
                "icon": "💧",
                "unit": "glasses",
                "targetAmount": 8,
                "incrementAmount": 1,
                "todayValue": 5,
                "progress": 0.625,
                "completed": false
            }
        ],
        "calculate": {
            "totalHabits": 3,
            "completedToday": 1,
            "inProgress": 2
        }
    }
}
```

---

### 2. **Get Habit Presets**
**GET** `http://localhost:3000/api/habits/presets`
**Headers:** 
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
**Body:** None (GET request)

**Response Example:**
```json
{
    "success": true,
    "message": "Habit presets retrieved successfully",
    "data": {
        "categories": ["health"],
        "presets": {
            "health": [
                {
                    "name": "Water Drinking",
                    "icon": "💧",
                    "unit": "glasses",
                    "targetAmount": 8,
                    "incrementAmount": 1,
                    "availableUnits": ["glasses", "liters", "cups"]
                },
                {
                    "name": "Healthy Eating",
                    "icon": "🥗",
                    "unit": "meals",
                    "targetAmount": 3,
                    "incrementAmount": 1,
                    "availableUnits": ["meals", "servings", "portions"]
                }
            ]
        }
    }
}
```

---

### 3. **Get Health Category Presets**
**GET** `http://localhost:3000/api/habits/presets/health`
**Headers:** 
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
**Body:** None (GET request)

---

### 4. **Add New Habit (From Default Preset)**
**POST** `http://localhost:3000/api/habits`
**Headers:** 
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
    "name": "Water Drinking",
    "type": "default",
    "category": "health"
}
```
**Note:** Preset'ten otomatik icon, unit, targetAmount, incrementAmount gelir

---

### 5. **Add Custom Habit**
**POST** `http://localhost:3000/api/habits`
**Headers:** 
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
    "name": "Protein Shake",
    "type": "other",
    "category": "health",
    "icon": "🥤",
    "unit": "shakes",
    "targetAmount": 2,
    "incrementAmount": 1,
    "availableUnits": ["shakes", "scoops"]
}
```

---

### 6. **Get Habit Detail**
**GET** `http://localhost:3000/api/habits/6507f1f4b0c6d700123456789`
**Headers:** 
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
**Body:** None (GET request)

**Response Example:**
```json
{
    "success": true,
    "message": "Habit details retrieved successfully",
    "data": {
        "id": "6507f1f4b0c6d700123456789",
        "name": "Water Drinking",
        "type": "preset",
        "category": "health",
        "icon": "💧",
        "unit": "glasses",
        "targetAmount": 8,
        "incrementAmount": 1,
        "availableUnits": ["glasses", "liters", "cups"],
        "isActive": true,
        "createdAt": "2025-08-09T10:30:00.000Z",
        "updatedAt": "2025-08-09T10:30:00.000Z",
        "todayProgress": {
            "value": 5,
            "progress": 0.625,
            "completed": false
        }
    }
}
```

---

### 7. **Update Habit**
**PATCH** `http://localhost:3000/api/habits/6507f1f4b0c6d700123456789`
**Headers:** 
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
    "name": "Daily Water",
    "targetAmount": 10,
    "incrementAmount": 2,
    "unit": "glasses"
}
```

---

### 8. **Increment Habit**
**POST** `http://localhost:3000/api/habits/6507f1f4b0c6d700123456789/increment`
**Headers:** 
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
**Body:** None (uses habit's incrementAmount)

**Response Example:**
```json
{
    "success": true,
    "message": "1 glasses added successfully",
    "data": {
        "habitId": "6507f1f4b0c6d700123456789",
        "newValue": 6,
        "targetAmount": 8,
        "progress": 0.75,
        "completed": false,
        "unit": "glasses",
        "incrementedBy": 1
    }
}
```

---

### 9. **Delete Habit**
**DELETE** `http://localhost:3000/api/habits/6507f1f4b0c6d700123456789`
**Headers:** 
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
**Body:** None

**Response Example:**
```json
{
    "success": true,
    "message": "Habit deleted successfully"
}
```

---

## 🚀 **Test Scenarios**

### **Scenario 1: Complete Habit Flow**
1. **Get Presets** → See available habits
2. **Add Habit** → Create "Water Drinking"  
3. **Get Dashboard** → See habit with 0 progress
4. **Increment** (5 times) → Add progress
5. **Get Dashboard** → See updated progress
6. **Get Detail** → See full habit info

### **Scenario 2: Habit Management**
1. **Add Habit** → Create habit
2. **Update Habit** → Change target amount
3. **Increment** → Test new increment
4. **Delete Habit** → Remove habit
5. **Get Dashboard** → Verify deletion

---

## 🔧 **Postman Environment Variables**

Create these in Postman:
```
baseUrl: http://localhost:3000/api
accessToken: (set after login)
habitId: (set after creating habit)
```

### **Auto-Set HabitId Script (Add to Add Habit Tests tab):**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("habitId", response.data.id);
}
```

---

## 📋 **Quick Test Collection**

### **1. Health Presets Test:**
```
GET {{baseUrl}}/habits/presets
GET {{baseUrl}}/habits/presets/health
```

### **2. Habit CRUD Test:**
```
POST {{baseUrl}}/habits (Add Water)
GET {{baseUrl}}/habits/dashboard
POST {{baseUrl}}/habits/{{habitId}}/increment
GET {{baseUrl}}/habits/{{habitId}}
PATCH {{baseUrl}}/habits/{{habitId}} (Update)
DELETE {{baseUrl}}/habits/{{habitId}}
```

### **3. All Available Default Habits:**
```json
// Water Drinking
{"name": "Water Drinking", "type": "default", "category": "health"}

// Healthy Eating  
{"name": "Healthy Eating", "type": "default", "category": "health"}

// Walking
{"name": "Walking", "type": "default", "category": "health"}

// Exercise
{"name": "Exercise", "type": "default", "category": "health"}

// Reading
{"name": "Reading", "type": "default", "category": "health"}

// Sleep
{"name": "Sleep", "type": "default", "category": "health"}
```

### **4. Custom Habit Example:**
```json
{"name": "Vitamin D", "type": "other", "category": "health", "icon": "�", "unit": "pills", "targetAmount": 1, "incrementAmount": 1}
```
