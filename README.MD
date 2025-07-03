# Personal Finance Tracker Backend

## Overview
This is a Node.js/Express/MongoDB backend for a personal finance tracker. It allows users to:
- Register and log in
- Add, edit, delete, and filter/search expenses
- Set monthly spending limits (budgets) per category
- Get warnings/alerts when spending approaches or exceeds budgets
- View all their expenses and total spending
- (Admin) View all users with their expenses and totals

---

## Models

### User
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `role`: String (`user` or `admin`)
- `categoryBudgets`: Object with keys for each category (e.g., Food, Rent, etc.)

### Expense
- `user`: ObjectId (reference to User)
- `amount`: Number
- `category`: String (e.g., Food, Rent, Shopping, etc.)
- `date`: Date
- `paymentMethod`: String (e.g., UPI, Credit Card, Cash)
- `notes`: String (optional)

---

## API Testing: Example Requests & Payloads

Below are example requests for all major APIs. Use these in Postman to test your backend.

### 1. Register
- **POST** `/api/v1/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login
- **POST** `/api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Logout
- **GET** `/api/v1/auth/logout`

### 4. Set Category Budgets
- **PATCH** `/api/v1/users/category-budgets`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "categoryBudgets": {
    "Food": 5000,
    "Rent": 10000,
    "Shopping": 2000
  }
}
```

### 5. Get Category Budgets
- **GET** `/api/v1/users/category-budgets`

### 6. Add Expense
- **POST** `/api/v1/expenses`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "amount": 1200,
  "category": "Food",
  "date": "2024-06-01",
  "paymentMethod": "UPI",
  "notes": "Dinner at restaurant"
}
```
- **Response Example (with alert):**
```json
{
  "expense": { /* ... */ },
  "alert": "Warning: You have crossed 80% of your Food budget for this month."
}
```

### 7. Edit Expense
- **PATCH** `/api/v1/expenses/:id`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "amount": 1500,
  "category": "Shopping",
  "date": "2024-06-02",
  "paymentMethod": "Credit Card",
  "notes": "Bought new shoes"
}
```
- **Response Example (with alert):**
```json
{
  "expense": { /* ... */ },
  "alert": "Alert: You have crossed 100% of your Shopping budget for this month."
}
```

### 8. Delete Expense
- **DELETE** `/api/v1/expenses/:id`

### 9. Get/Filter/Search Expenses
- **GET** `/api/v1/expenses`
- **Query Examples:**
  - `/api/v1/expenses?category=Food`
  - `/api/v1/expenses?paymentMethod=UPI`
  - `/api/v1/expenses?startDate=2024-06-01&endDate=2024-06-30`
  - `/api/v1/expenses?search=restaurant`

### 10. Get My Expenses Details
- **GET** `/api/v1/users/my-expenses-details`
- **Response Example:**
```json
{
  "user": { /* user details */ },
  "expenses": [ /* all expenses for this user */ ],
  "totalExpenses": 4200
}
```

### 11. Get All Users with Expenses (Admin Only)
- **GET** `/api/v1/users/all-with-expenses`
- **Response Example:**
```json
{
  "users": [
    {
      "user": { /* user details */ },
      "expenses": [ /* all expenses for this user */ ],
      "totalExpenses": 12345
    },
    // ...more users
  ]
}
```

### 12. Alert Testing Example
- **Set Food budget to 5000**
- **Add ₹3000 expense** (no alert)
- **Add ₹1200 expense** (should get 80% warning)
- **Add ₹1000 expense** (should get 100% alert)

---

## Authentication
- All endpoints except register/login/logout require authentication (cookie or token)
- Admin endpoints require admin role

---

## Environment Variables
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT
- `JWT_LIFETIME` - e.g., 1d

---

## Running the Project
1. Install dependencies: `npm install`
2. Set up `.env` file with required variables
3. Start the server: `node app.js` or `npm start`

---

## Postman Collection
A ready-to-import Postman collection is provided in `expenses.postman_collection.json` for quick testing of all endpoints.
