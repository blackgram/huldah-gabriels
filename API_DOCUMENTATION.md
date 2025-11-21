# Huldah Gabriels REST API Documentation

**Base URL:** `https://api.huldahgabriels.com/v1` (Production)  
**Base URL:** `http://localhost:3000/api` (Development)

**Authentication:** Bearer Token (JWT) for protected endpoints

---

## Table of Contents

1. [Authentication](#authentication)
2. [Products API](#products-api)
3. [Orders API](#orders-api)
4. [Reviews API](#reviews-api)
5. [Waitlist API](#waitlist-api)
6. [Discount Codes API](#discount-codes-api)
7. [Admin API](#admin-api)
8. [Payment API](#payment-api)
9. [Email API](#email-api)

---

## Authentication

### Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate admin user and receive JWT token

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-uid-123",
    "email": "admin@example.com",
    "permissions": ["products", "orders", "waitlist"]
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### Check Session

**Endpoint:** `GET /auth/session`

**Description:** Verify current session validity

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "valid": true,
  "user": {
    "id": "admin-uid-123",
    "email": "admin@example.com",
    "permissions": ["products", "orders", "waitlist"]
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

---

### Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidate current session

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Products API

### Get All Products

**Endpoint:** `GET /products`

**Description:** Retrieve all products

**Query Parameters:**
- `active` (optional, boolean): Filter by active status
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-123",
      "name": "Luxury Lipgloss",
      "desc": "Premium lipgloss with long-lasting color",
      "display": "https://example.com/images/lipgloss.jpg",
      "price": 29.99,
      "color": "#FF5733",
      "isActive": true,
      "isOnSale": false,
      "discountPercentage": null,
      "originalPrice": null,
      "saleStartDate": null,
      "saleEndDate": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### Get Active Products

**Endpoint:** `GET /products/active`

**Description:** Retrieve only active products

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-123",
      "name": "Luxury Lipgloss",
      "desc": "Premium lipgloss with long-lasting color",
      "display": "https://example.com/images/lipgloss.jpg",
      "price": 29.99,
      "color": "#FF5733",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 35,
    "totalPages": 2
  }
}
```

---

### Get Product by ID

**Endpoint:** `GET /products/:id`

**Description:** Retrieve a single product by ID

**Path Parameters:**
- `id` (required, string): Product ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "prod-123",
    "name": "Luxury Lipgloss",
    "desc": "Premium lipgloss with long-lasting color",
    "display": "https://example.com/images/lipgloss.jpg",
    "price": 29.99,
    "color": "#FF5733",
    "isActive": true,
    "isOnSale": true,
    "discountPercentage": 20,
    "originalPrice": 37.49,
    "saleStartDate": "2024-12-01T00:00:00Z",
    "saleEndDate": "2024-12-31T23:59:59Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

### Create Product

**Endpoint:** `POST /products`

**Description:** Create a new product (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Lipgloss",
  "desc": "Description of the product",
  "display": "https://example.com/images/product.jpg",
  "price": 29.99,
  "color": "#FF5733",
  "isActive": true,
  "isOnSale": false,
  "discountPercentage": null,
  "originalPrice": null,
  "saleStartDate": null,
  "saleEndDate": null
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "prod-456",
    "name": "New Lipgloss",
    "desc": "Description of the product",
    "display": "https://example.com/images/product.jpg",
    "price": 29.99,
    "color": "#FF5733",
    "isActive": true,
    "createdAt": "2024-01-25T10:30:00Z",
    "updatedAt": "2024-01-25T10:30:00Z"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "price": "Price must be a positive number"
  }
}
```

---

### Update Product

**Endpoint:** `PUT /products/:id`

**Description:** Update an existing product (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
- `id` (required, string): Product ID

**Request Body:**
```json
{
  "name": "Updated Lipgloss",
  "price": 34.99,
  "isOnSale": true,
  "discountPercentage": 15,
  "originalPrice": 41.16,
  "saleStartDate": "2024-12-01T00:00:00Z",
  "saleEndDate": "2024-12-31T23:59:59Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "prod-123",
    "name": "Updated Lipgloss",
    "price": 34.99,
    "isOnSale": true,
    "discountPercentage": 15,
    "originalPrice": 41.16,
    "updatedAt": "2024-01-25T15:45:00Z"
  }
}
```

---

### Delete Product

**Endpoint:** `DELETE /products/:id`

**Description:** Delete a product (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (required, string): Product ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Toggle Product Active Status

**Endpoint:** `PATCH /products/:id/toggle`

**Description:** Toggle product active/inactive status (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
- `id` (required, string): Product ID

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "prod-123",
    "isActive": false,
    "updatedAt": "2024-01-25T16:00:00Z"
  }
}
```

---

## Orders API

### Create Order

**Endpoint:** `POST /orders`

**Description:** Create a new order (Public endpoint)

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentMethod": "stripe",
  "transactionReference": "cs_test_1234567890",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "customerAddress": "123 Main St",
  "customerCountry": "United States",
  "amount": 89.97,
  "currency": "usd",
  "items": [
    {
      "name": "Luxury Lipgloss",
      "quantity": 2,
      "price": 29.99,
      "productId": "prod-123"
    },
    {
      "name": "Lip Balm",
      "quantity": 1,
      "price": 29.99,
      "productId": "prod-456"
    }
  ],
  "paymentStatus": "paid",
  "orderStatus": "pending",
  "discountCode": "SAVE20",
  "discountAmount": 18.00
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "order-789",
    "paymentMethod": "stripe",
    "transactionReference": "cs_test_1234567890",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "customerAddress": "123 Main St",
    "customerCountry": "United States",
    "amount": 89.97,
    "currency": "usd",
    "items": [
      {
        "name": "Luxury Lipgloss",
        "quantity": 2,
        "price": 29.99,
        "productId": "prod-123"
      }
    ],
    "paymentStatus": "paid",
    "orderStatus": "pending",
    "discountCode": "SAVE20",
    "discountAmount": 18.00,
    "createdAt": "2024-01-25T10:30:00Z",
    "updatedAt": "2024-01-25T10:30:00Z"
  }
}
```

---

### Get All Orders

**Endpoint:** `GET /orders`

**Description:** Retrieve all orders (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional, string): Filter by order status
- `paymentStatus` (optional, string): Filter by payment status
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "order-789",
      "paymentMethod": "stripe",
      "transactionReference": "cs_test_1234567890",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "+1234567890",
      "customerAddress": "123 Main St",
      "customerCountry": "United States",
      "amount": 89.97,
      "currency": "usd",
      "items": [
        {
          "name": "Luxury Lipgloss",
          "quantity": 2,
          "price": 29.99
        }
      ],
      "paymentStatus": "paid",
      "orderStatus": "pending",
      "trackingNumber": null,
      "courier": null,
      "createdAt": "2024-01-25T10:30:00Z",
      "updatedAt": "2024-01-25T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### Get Order by ID

**Endpoint:** `GET /orders/:id`

**Description:** Retrieve a single order by ID (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (required, string): Order ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "order-789",
    "paymentMethod": "stripe",
    "transactionReference": "cs_test_1234567890",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "customerAddress": "123 Main St",
    "customerCountry": "United States",
    "amount": 89.97,
    "currency": "usd",
    "items": [
      {
        "name": "Luxury Lipgloss",
        "quantity": 2,
        "price": 29.99,
        "productId": "prod-123"
      }
    ],
    "paymentStatus": "paid",
    "orderStatus": "pending",
    "trackingNumber": null,
    "courier": null,
    "notes": null,
    "createdAt": "2024-01-25T10:30:00Z",
    "updatedAt": "2024-01-25T10:30:00Z"
  }
}
```

---

### Update Order Status

**Endpoint:** `PUT /orders/:id/status`

**Description:** Update order status (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
- `id` (required, string): Order ID

**Request Body:**
```json
{
  "orderStatus": "shipped",
  "trackingNumber": "TRACK123456789",
  "courier": "FedEx",
  "notes": "Shipped via express delivery"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "order-789",
    "orderStatus": "shipped",
    "trackingNumber": "TRACK123456789",
    "courier": "FedEx",
    "notes": "Shipped via express delivery",
    "updatedAt": "2024-01-26T10:30:00Z"
  }
}
```

---

### Update Payment Status

**Endpoint:** `PUT /orders/:id/payment`

**Description:** Update payment status (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
- `id` (required, string): Order ID

**Request Body:**
```json
{
  "paymentStatus": "refunded"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "order-789",
    "paymentStatus": "refunded",
    "updatedAt": "2024-01-26T11:00:00Z"
  }
}
```

---

### Get Orders by Status

**Endpoint:** `GET /orders/status/:status`

**Description:** Get orders filtered by status (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `status` (required, string): Order status (pending, processing, shipped, delivered, cancelled)

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "order-789",
      "orderStatus": "pending",
      "customerName": "John Doe",
      "amount": 89.97,
      "createdAt": "2024-01-25T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

---

### Get Order Statistics

**Endpoint:** `GET /orders/stats`

**Description:** Get order statistics (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 13495.50,
    "pendingOrders": 25,
    "processingOrders": 15,
    "shippedOrders": 45,
    "deliveredOrders": 60,
    "cancelledOrders": 5
  }
}
```

---

## Reviews API

### Add Review

**Endpoint:** `POST /reviews`

**Description:** Add a new product review (Public endpoint)

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "prod-123",
  "productName": "Luxury Lipgloss",
  "userName": "Jane Smith",
  "rating": 5,
  "comment": "Amazing product! Love the color and texture."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "review-456",
    "productId": "prod-123",
    "productName": "Luxury Lipgloss",
    "userName": "Jane Smith",
    "rating": 5,
    "comment": "Amazing product! Love the color and texture.",
    "timestamp": "2024-01-25T12:00:00Z"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "rating": "Rating must be between 1 and 5",
    "comment": "Comment is required"
  }
}
```

---

### Get Reviews by Product

**Endpoint:** `GET /reviews/product/:productId`

**Description:** Get all reviews for a specific product

**Path Parameters:**
- `productId` (required, string): Product ID

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "review-456",
      "productId": "prod-123",
      "productName": "Luxury Lipgloss",
      "userName": "Jane Smith",
      "rating": 5,
      "comment": "Amazing product! Love the color and texture.",
      "timestamp": "2024-01-25T12:00:00Z"
    },
    {
      "id": "review-457",
      "productId": "prod-123",
      "productName": "Luxury Lipgloss",
      "userName": "John Doe",
      "rating": 4,
      "comment": "Great product, would buy again.",
      "timestamp": "2024-01-24T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### Get Latest Reviews

**Endpoint:** `GET /reviews/latest`

**Description:** Get latest reviews across all products

**Query Parameters:**
- `limit` (optional, number): Number of reviews (default: 10, max: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "review-456",
      "productId": "prod-123",
      "productName": "Luxury Lipgloss",
      "userName": "Jane Smith",
      "rating": 5,
      "comment": "Amazing product!",
      "timestamp": "2024-01-25T12:00:00Z"
    }
  ]
}
```

---

### Get Average Rating

**Endpoint:** `GET /reviews/product/:productId/rating`

**Description:** Get average rating for a product

**Path Parameters:**
- `productId` (required, string): Product ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "productId": "prod-123",
    "averageRating": 4.5,
    "totalReviews": 45,
    "ratingBreakdown": {
      "5": 20,
      "4": 15,
      "3": 7,
      "2": 2,
      "1": 1
    }
  }
}
```

---

## Waitlist API

### Add to Waitlist

**Endpoint:** `POST /waitlist`

**Description:** Add email to waitlist (Public endpoint)

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "waitlist-123",
    "email": "user@example.com",
    "name": "John Doe",
    "timestamp": "2024-01-25T10:30:00Z",
    "hasBeenContacted": false
  },
  "message": "Welcome email sent successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Email already exists in waitlist"
}
```

---

### Get All Waitlist Entries

**Endpoint:** `GET /waitlist`

**Description:** Get all waitlist entries (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `contacted` (optional, boolean): Filter by contacted status
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "waitlist-123",
      "email": "user@example.com",
      "name": "John Doe",
      "timestamp": "2024-01-25T10:30:00Z",
      "hasBeenContacted": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

---

### Get Uncontacted Emails

**Endpoint:** `GET /waitlist/uncontacted`

**Description:** Get emails that haven't been contacted (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "email": "user1@example.com",
      "name": "User One"
    },
    {
      "email": "user2@example.com",
      "name": "User Two"
    }
  ],
  "count": 150
}
```

---

### Mark Email as Contacted

**Endpoint:** `POST /waitlist/mark-contacted`

**Description:** Mark email(s) as contacted (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "emails": ["user1@example.com", "user2@example.com"],
  "emailType": "bulk-email"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "2 emails marked as contacted"
}
```

---

### Delete Waitlist Entry

**Endpoint:** `DELETE /waitlist/:id`

**Description:** Delete waitlist entry (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (required, string): Waitlist entry ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Waitlist entry deleted successfully"
}
```

---

## Discount Codes API

### Get All Discount Codes

**Endpoint:** `GET /discount-codes`

**Description:** Get all discount codes (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "code-123",
      "code": "SAVE20",
      "type": "percentage",
      "value": 20,
      "isActive": true,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z",
      "usageLimit": 100,
      "usageCount": 45,
      "minPurchaseAmount": 50,
      "description": "20% off on orders over $50",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ]
}
```

---

### Get Active Discount Codes

**Endpoint:** `GET /discount-codes/active`

**Description:** Get only active discount codes (Public endpoint)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "code-123",
      "code": "SAVE20",
      "type": "percentage",
      "value": 20,
      "isActive": true,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z",
      "usageLimit": 100,
      "usageCount": 45,
      "minPurchaseAmount": 50
    }
  ]
}
```

---

### Validate Discount Code

**Endpoint:** `POST /discount-codes/validate`

**Description:** Validate a discount code and calculate discount (Public endpoint)

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "orderTotal": 100.00
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "valid": true,
  "data": {
    "code": "SAVE20",
    "type": "percentage",
    "value": 20,
    "discountAmount": 20.00,
    "finalAmount": 80.00
  }
}
```

**Error Response:** `200 OK` (code invalid)
```json
{
  "success": true,
  "valid": false,
  "error": "This discount code has expired"
}
```

---

### Create Discount Code

**Endpoint:** `POST /discount-codes`

**Description:** Create a new discount code (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "WELCOME10",
  "type": "percentage",
  "value": 10,
  "isActive": true,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "usageLimit": 500,
  "minPurchaseAmount": 25,
  "description": "10% off for new customers"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "code-456",
    "code": "WELCOME10",
    "type": "percentage",
    "value": 10,
    "isActive": true,
    "usageCount": 0,
    "createdAt": "2024-01-25T10:30:00Z"
  }
}
```

---

### Update Discount Code

**Endpoint:** `PUT /discount-codes/:id`

**Description:** Update discount code (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
- `id` (required, string): Discount code ID

**Request Body:**
```json
{
  "isActive": false,
  "usageLimit": 1000
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "code-123",
    "isActive": false,
    "usageLimit": 1000,
    "updatedAt": "2024-01-25T15:00:00Z"
  }
}
```

---

### Delete Discount Code

**Endpoint:** `DELETE /discount-codes/:id`

**Description:** Delete discount code (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (required, string): Discount code ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Discount code deleted successfully"
}
```

---

### Get Discount Code Usage History

**Endpoint:** `GET /discount-codes/:id/usage`

**Description:** Get usage history for a discount code (Admin only)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (required, string): Discount code ID

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "usage-123",
      "codeId": "code-123",
      "code": "SAVE20",
      "orderId": "order-789",
      "email": "customer@example.com",
      "discountAmount": 20.00,
      "orderTotal": 100.00,
      "timestamp": "2024-01-25T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### Record Discount Code Usage

**Endpoint:** `POST /discount-codes/usage`

**Description:** Record discount code usage (Public endpoint, called during checkout)

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "codeId": "code-123",
  "code": "SAVE20",
  "orderId": "order-789",
  "email": "customer@example.com",
  "discountAmount": 20.00,
  "orderTotal": 100.00,
  "userId": "user-123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Usage recorded successfully"
}
```

---

## Payment API

### Create Stripe Checkout Session

**Endpoint:** `POST /payments/stripe/checkout`

**Description:** Create Stripe checkout session

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 89.97,
  "currency": "usd",
  "customerEmail": "customer@example.com",
  "orderItems": [
    {
      "name": "Luxury Lipgloss",
      "description": "Premium lipgloss",
      "price": 29.99,
      "quantity": 2,
      "image": "https://example.com/images/lipgloss.jpg"
    }
  ],
  "metadata": {
    "orderId": "order-789",
    "customerName": "John Doe"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_1234567890",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

---

### Get Stripe Session

**Endpoint:** `GET /payments/stripe/session`

**Description:** Get Stripe checkout session details

**Query Parameters:**
- `session_id` (required, string): Stripe session ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_1234567890",
    "customerName": "John Doe",
    "customerEmail": "customer@example.com",
    "customerPhone": "+1234567890",
    "customerAddress": "123 Main St",
    "customerCountry": "United States",
    "amount": 89.97,
    "currency": "usd",
    "items": [
      {
        "name": "Luxury Lipgloss",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "paymentStatus": "paid"
  }
}
```

---

## Email API

### Send Email

**Endpoint:** `POST /email/send`

**Description:** Send a single email

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Welcome to Huldah Gabriels",
  "html": "<html><body><h1>Welcome!</h1></body></html>"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "messageId": "message-id-123"
}
```

---

### Send Bulk Email

**Endpoint:** `POST /email/bulk`

**Description:** Send bulk emails to multiple recipients

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipients": [
    {
      "email": "user1@example.com",
      "name": "User One"
    },
    {
      "email": "user2@example.com",
      "name": "User Two"
    }
  ],
  "subject": "Special Offer",
  "html": "<html><body><h1>Special Offer!</h1></body></html>"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "successfulEmails": ["user1@example.com", "user2@example.com"],
  "failedEmails": []
}
```

---

### Send Order Confirmation Email

**Endpoint:** `POST /email/order-confirmation`

**Description:** Send order confirmation email

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderDetails": {
    "id": "order-789",
    "customerName": "John Doe",
    "customerEmail": "customer@example.com",
    "customerPhone": "+1234567890",
    "customerAddress": "123 Main St",
    "customerCountry": "United States",
    "amount": 89.97,
    "currency": "usd",
    "items": [
      {
        "name": "Luxury Lipgloss",
        "quantity": 2,
        "price": 29.99
      }
    ]
  },
  "sessionId": "cs_test_1234567890"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "messageId": "message-id-123"
}
```

---

### Send Order Status Update Email

**Endpoint:** `POST /email/order-status-update`

**Description:** Send order status update email

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderDetails": {
    "id": "order-789",
    "customerName": "John Doe",
    "customerEmail": "customer@example.com",
    "customerPhone": "+1234567890",
    "customerAddress": "123 Main St",
    "customerCountry": "United States",
    "amount": 89.97,
    "currency": "usd",
    "items": [
      {
        "name": "Luxury Lipgloss",
        "quantity": 2,
        "price": 29.99
      }
    ]
  },
  "newStatus": "shipped",
  "trackingNumber": "TRACK123456789",
  "courier": "FedEx"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "messageId": "message-id-123"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "Error message"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized. Please provide a valid token."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden. You don't have permission to access this resource."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Public Endpoints:** 100 requests per 15 minutes per IP
- **Authenticated Endpoints:** 1000 requests per 15 minutes per user
- **Payment Endpoints:** 10 requests per minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643123456
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Authentication

Most endpoints require authentication using Bearer token:

```
Authorization: Bearer {jwt_token}
```

Tokens are obtained via `/auth/login` endpoint and expire after 7 days.

---

**Last Updated:** 2025-01-27  
**API Version:** 1.0.0

