# Backend Migration Guide
## Complete API Documentation & Data Structures

This document provides comprehensive documentation of all API calls, data structures, and integrations needed to migrate from Firebase/Firestore to a custom backend solution.

---

## Table of Contents

1. [Data Models](#data-models)
2. [API Endpoints](#api-endpoints)
3. [External Integrations](#external-integrations)
4. [Authentication & Authorization](#authentication--authorization)
5. [Backend Structure](#backend-structure)
6. [Migration Checklist](#migration-checklist)

---

## Data Models

### 1. Products Collection

**Collection Name:** `products`

**Data Structure:**
```typescript
interface Product {
  id: string;                    // Document ID
  name: string;                  // Product name
  desc: string;                  // Product description
  reviews: never[];              // Legacy field (not used)
  display: string;               // Image URL or path
  price: number;                 // Current price
  color: string;                 // Product color hex code
  createdAt?: Date | string;     // Creation timestamp
  updatedAt?: Date | string;    // Last update timestamp
  isActive?: boolean;            // Soft delete flag (default: true)
  
  // Discount fields
  isOnSale?: boolean;            // Whether product is on sale
  discountPercentage?: number;   // Discount percentage (0-100)
  originalPrice?: number;        // Original price before discount
  saleStartDate?: Date | string; // Sale start date
  saleEndDate?: Date | string;  // Sale end date
}
```

**Operations:**
- `getAllProducts()` - Get all products (ordered by createdAt desc)
- `getActiveProducts()` - Get only active products
- `getProductById(id)` - Get single product by ID
- `createProduct(data)` - Create new product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Hard delete product
- `toggleProductActive(id, isActive)` - Soft delete/activate product

**Used In:**
- `src/services/productService.ts`
- `src/components/shop/Shop.tsx`
- `src/components/admin/AdminProducts.tsx`
- `src/Redux/features/productsSlice.ts`

---

### 2. Orders Collection

**Collection Name:** `orders`

**Data Structure:**
```typescript
interface Order {
  id: string;                    // Document ID
  paymentMethod: 'stripe' | 'paystack' | 'paypal';
  transactionReference: string;  // Stripe session_id, Paystack reference, PayPal order_id
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCountry: string;
  amount: number;                // Total order amount
  currency: string;              // Currency code (e.g., 'usd', 'ngn')
  items: OrderItem[];            // Order items
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date | string;
  updatedAt: Date | string;
  notes?: string;                // Admin notes
  trackingNumber?: string;       // Shipping tracking number
  courier?: string;              // Shipping courier name
  
  // Discount code fields (if applied)
  discountCode?: string;          // Discount code used
  discountAmount?: number;       // Discount amount applied
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;                 // Price per unit
  productId?: string;            // Optional: link to product
}
```

**Operations:**
- `createOrder(orderInput)` - Create new order
- `getAllOrders()` - Get all orders (ordered by createdAt desc)
- `getOrderById(id)` - Get single order by ID
- `updateOrderStatus(id, status, notes?, trackingNumber?, courier?)` - Update order status
- `updatePaymentStatus(id, status)` - Update payment status
- `getOrdersByStatus(status)` - Filter orders by status
- `getOrderStatistics()` - Get order statistics (total, revenue, counts by status)

**Used In:**
- `src/services/orderService.ts`
- `src/components/CheckoutModal.tsx` (createOrder)
- `src/components/CheckoutSuccess.tsx` (createOrder)
- `src/components/admin/AdminOrders.tsx` (getAllOrders, updateOrderStatus)

---

### 3. Reviews Collection

**Collection Name:** `reviews`

**Data Structure:**
```typescript
interface Review {
  id?: string;                   // Document ID
  productId: string | number;    // Product ID (supports both string and number)
  productName: string;           // Product name
  userName: string;              // Reviewer name
  rating: number;                // Rating (1-5 stars)
  comment: string;               // Review comment
  timestamp: Date | Timestamp;   // Review timestamp
}
```

**Operations:**
- `addReview(productId, productName, userName, rating, comment)` - Add new review
- `getReviewsByProductId(productId, productName?)` - Get reviews for a product
- `getLatestReviews(limit)` - Get latest N reviews across all products
- `getAverageRating(productId)` - Calculate average rating for a product
- `calculateAverageRating(reviews)` - Calculate average from reviews array

**Used In:**
- `src/services/reviewService.ts`
- `src/components/Home/Review.tsx`
- `src/components/shop/productsDetails.ts`

---

### 4. Waitlist Collection

**Collection Name:** `waitlist`

**Data Structure:**
```typescript
interface WaitlistEntry {
  id?: string;                   // Document ID
  email: string;                 // Email address (unique)
  name?: string;                 // Optional name
  timestamp: Date | Timestamp;   // Signup timestamp
  hasBeenContacted?: boolean;   // Whether email has been sent
  emailHash?: string;           // Base64 hash of email (for deduplication)
}

interface EmailRecipient {
  email: string;
  name?: string;
}
```

**Subcollection:** `waitlist/{entryId}/contactHistory` - Tracks email contact history

**Operations:**
- `addToWaitlist(email, name?)` - Add email to waitlist (sends welcome email)
- `getWaitlistEntries()` - Get all waitlist entries (admin only)
- `getUncontactedEmails()` - Get emails that haven't been contacted (admin only)
- `markEmailAsContacted(email, emailType)` - Mark email as contacted
- `markEmailsAsContacted(emails[])` - Mark multiple emails as contacted
- `deleteWaitlistEntry(id)` - Delete waitlist entry (admin only)
- `getWaitlistEntry(id)` - Get single waitlist entry

**Used In:**
- `src/services/waitListService.ts`
- `src/components/WaitList.tsx` (addToWaitlist)
- `src/components/admin/AdminWaitList.tsx` (all operations)
- `src/services/emailService.ts` (getUncontactedEmails for bulk emails)

---

### 5. Discount Codes Collection

**Collection Name:** `discountCodes`

**Data Structure:**
```typescript
interface DiscountCode {
  id: string;                    // Document ID
  code: string;                  // Discount code (e.g., "SAVE20", "WELCOME10")
  type: 'percentage' | 'fixed';  // Discount type
  value: number;                 // Percentage (0-100) or fixed amount
  isActive: boolean;             // Whether code is active
  startDate?: Date | string;     // Optional start date
  endDate?: Date | string;       // Optional end date
  usageLimit?: number;           // Maximum usage count (optional)
  usageCount: number;            // Current usage count
  minPurchaseAmount?: number;     // Minimum order amount required
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;             // Admin user ID who created it
  description?: string;          // Optional description
}
```

**Operations:**
- `getAllDiscountCodes()` - Get all discount codes
- `getActiveDiscountCodes()` - Get only active codes
- `getDiscountCodeById(id)` - Get code by ID
- `validateDiscountCode(code, orderTotal)` - Validate code and calculate discount
- `createDiscountCode(data, createdBy?)` - Create new discount code
- `updateDiscountCode(id, data)` - Update discount code
- `deleteDiscountCode(id)` - Delete discount code
- `toggleDiscountCodeActive(id, isActive)` - Toggle active status
- `recordDiscountCodeUsage(codeId, code, orderId, email, discountAmount, orderTotal, userId?)` - Record usage
- `getDiscountCodeUsage(codeId?)` - Get usage history

**Used In:**
- `src/services/discountCodeService.ts`
- `src/components/CheckoutModal.tsx` (validateDiscountCode, recordDiscountCodeUsage)
- `src/components/admin/AdminDiscountCodes.tsx` (all operations)

---

### 6. Discount Code Usage Collection

**Collection Name:** `discountCodeUsage`

**Data Structure:**
```typescript
interface DiscountCodeUsage {
  id?: string;                   // Document ID
  codeId: string;                // Reference to discount code
  code: string;                  // Discount code string
  orderId: string;                // Order ID where code was used
  userId?: string;               // Optional user ID
  email: string;                  // Customer email
  discountAmount: number;         // Discount amount applied
  orderTotal: number;             // Order total before discount
  timestamp: Date | Timestamp;    // Usage timestamp
}
```

**Operations:**
- `recordDiscountCodeUsage(...)` - Record usage (creates document)
- `getDiscountCodeUsage(codeId?)` - Get usage history (admin only)

**Used In:**
- `src/services/discountCodeService.ts`
- `src/components/CheckoutModal.tsx` (recordDiscountCodeUsage)
- `src/components/admin/AdminDiscountCodes.tsx` (getDiscountCodeUsage)

---

### 7. Admins Collection

**Collection Name:** `admins`

**Data Structure:**
```typescript
interface Admin {
  id: string;                     // Document ID (same as Firebase Auth UID)
  email: string;                  // Admin email
  permissions?: string[];         // Optional permissions array
  // Additional admin fields can be added here
}
```

**Operations:**
- `checkIfUserIsAdmin(uid)` - Check if user is admin
- `getAdminDetails(uid)` - Get admin details
- `checkAdminPermission(uid, permission)` - Check specific permission

**Used In:**
- `src/services/adminService.ts`
- `src/Hooks/useAuth.ts` (checkIfUserIsAdmin)
- `src/components/admin/AdminManagement.tsx`

---

## API Endpoints

### Vercel Serverless Functions

All API endpoints are located in `/api` directory and deployed as Vercel serverless functions.

#### 1. Stripe Checkout API

**Endpoint:** `POST /api/create-stripe-checkout`

**Request Body:**
```typescript
{
  amount: number;                // Order total amount
  currency?: string;             // Currency code (default: 'usd')
  customerEmail: string;         // Customer email
  orderItems?: Array<{           // Optional: detailed line items
    name: string;
    description?: string;
    price: number;               // Price per unit
    quantity: number;
    image?: string;              // Product image URL
  }>;
  metadata?: Record<string, any>; // Optional metadata
}
```

**Response:**
```typescript
{
  sessionId: string;             // Stripe checkout session ID
  url: string;                   // Stripe checkout URL
}
```

**Error Response:**
```typescript
{
  error: string;                 // Error message
  details?: string;              // Error details (dev only)
}
```

**Used In:**
- `src/components/CheckoutModal.tsx` (handleStripeCheckout)

**Implementation:** `api/create-stripe-checkout.ts`

---

#### 2. Get Stripe Session API

**Endpoint:** `GET /api/get-stripe-session?session_id={sessionId}`

**Query Parameters:**
- `session_id` (required): Stripe checkout session ID

**Response:**
```typescript
{
  sessionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCountry: string;
  amount: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentStatus: string;          // 'paid', 'pending', etc.
}
```

**Used In:**
- `src/components/CheckoutSuccess.tsx` (fetching order details after Stripe redirect)

**Implementation:** `api/get-stripe-session.ts`

---

#### 3. Send Email API

**Endpoint:** `POST /api/send-email`

**Request Body:**
```typescript
{
  to: string;                    // Recipient email
  subject: string;                // Email subject
  html: string;                  // HTML email body
}
```

**Response:**
```typescript
{
  success: boolean;
  messageId?: string;            // Email message ID
  error?: string;                // Error message if failed
}
```

**Environment Variables Required:**
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port (default: 587)
- `EMAIL_SECURE` - Use TLS (default: 'true')
- `EMAIL_USER` - SMTP username
- `EMAIL_PASSWORD` - SMTP password
- `EMAIL_FROM` - Sender email address
- `EMAIL_FROM_NAME` - Sender name

**Used In:**
- `src/services/emailService.ts` (sendWelcomeEmail, sendVerificationEmail)

**Implementation:** `api/send-email.ts`

---

#### 4. Send Order Confirmation Email API

**Endpoint:** `POST /api/send-order-confirmation`

**Request Body:**
```typescript
{
  orderDetails: {
    id?: string;                 // Order ID
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCountry: string;
    amount: number;
    currency: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  sessionId: string;            // Payment session ID
}
```

**Response:**
```typescript
{
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**Used In:**
- `src/components/CheckoutSuccess.tsx` (after successful payment)

**Implementation:** `api/send-order-confirmation.ts`

---

#### 5. Send Order Status Update Email API

**Endpoint:** `POST /api/send-order-status-update`

**Request Body:**
```typescript
{
  orderDetails: {
    id?: string;
    transactionReference?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCountry: string;
    amount: number;
    currency: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  newStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;       // Required if status is 'shipped'
  courier?: string;              // Optional courier name
}
```

**Response:**
```typescript
{
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**Used In:**
- `src/components/admin/AdminOrders.tsx` (when updating order status)

**Implementation:** `api/send-order-status-update.ts`

---

#### 6. Send Bulk Email API

**Endpoint:** `POST /api/send-bulk-email`

**Request Body:**
```typescript
{
  recipients: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  html: string;                  // Email template HTML
}
```

**Response:**
```typescript
{
  success: boolean;
  sent: number;                  // Number of successful sends
  failed: number;                // Number of failed sends
  successfulEmails: string[];    // Array of successful email addresses
  failedEmails: Array<{          // Array of failed emails with errors
    email: string;
    error: string;
  }>;
}
```

**Used In:**
- `src/services/emailService.ts` (sendBulkEmail)

**Implementation:** `api/send-bulk-email.ts`

---

#### 7. Send Test Email API

**Endpoint:** `POST /api/send-test-email`

**Request Body:**
```typescript
{
  to: string;
  subject: string;
  html: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**Note:** Adds "[TEST]" prefix to subject line

**Used In:**
- `src/services/emailService.ts` (sendTestEmail)
- Admin testing functionality

**Implementation:** `api/send-test-email.ts`

---

## External Integrations

### 1. Stripe Integration

**SDK:** `stripe` (npm package)

**API Version:** `2025-11-17.clover`

**Environment Variables:**
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with `sk_test_` or `sk_live_`)

**Operations:**
- Create checkout session
- Retrieve checkout session
- Handle webhooks (not currently implemented, but recommended)

**Endpoints Used:**
- `stripe.checkout.sessions.create()` - Create checkout session
- `stripe.checkout.sessions.retrieve()` - Get session details

**Used In:**
- `api/create-stripe-checkout.ts`
- `api/get-stripe-session.ts`
- `src/components/CheckoutModal.tsx`

---

### 2. PayPal Integration

**SDK:** `@paypal/react-paypal-js` (client-side)

**Environment Variables:**
- `VITE_PAYPAL_CLIENT_ID` - PayPal client ID

**Operations:**
- Create PayPal order (client-side)
- Capture PayPal payment (client-side)

**Note:** Currently implemented client-side only. Backend integration recommended for production.

**Used In:**
- `src/components/CheckoutModal.tsx` (PayPalButtons component)

**PayPal API Endpoints (to be implemented):**
- `POST /v2/checkout/orders` - Create order
- `POST /v2/checkout/orders/{id}/capture` - Capture payment

---

### 3. Paystack Integration

**SDK:** `react-paystack` (client-side)

**Environment Variables:**
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key

**Operations:**
- Initialize payment (client-side)
- Verify payment (client-side)

**Note:** Currently implemented client-side only. Backend integration recommended for production.

**Used In:**
- `src/components/CheckoutModal.tsx` (PaystackButton component)

**Paystack API Endpoints (to be implemented):**
- `POST /transaction/initialize` - Initialize transaction
- `GET /transaction/verify/{reference}` - Verify transaction

---

### 4. Email Service (Nodemailer)

**SDK:** `nodemailer` (npm package)

**SMTP Configuration:**
- Host: `EMAIL_HOST`
- Port: `EMAIL_PORT` (default: 587)
- Secure: `EMAIL_SECURE` (default: 'true')
- Auth: `EMAIL_USER`, `EMAIL_PASSWORD`
- From: `EMAIL_FROM`, `EMAIL_FROM_NAME`

**Email Templates:**
- Welcome email
- Launch announcement
- Exclusive preview
- Discount offer
- Verification email
- Order confirmation
- Order status update

**Used In:**
- All email API endpoints (`/api/send-email`, `/api/send-order-confirmation`, etc.)
- `src/services/emailService.ts`

---

## Authentication & Authorization

### Firebase Authentication

**Current Implementation:**
- Email/Password authentication
- Admin-only access (checked via `admins` collection)

**Operations:**
- `loginUser(email, password)` - Sign in admin user
- `logoutUser()` - Sign out user
- `checkUserSession()` - Check if user session is valid

**Used In:**
- `src/services/authService.ts`
- `src/Hooks/useAuth.ts`
- `src/components/admin/AdminLogin.tsx`

**Admin Check:**
- User must exist in `admins` collection with document ID = Firebase Auth UID
- Admin status checked via `checkIfUserIsAdmin(uid)`

**Permissions:**
- Optional permissions array in admin document
- Checked via `checkAdminPermission(uid, permission)`

---

## Backend Structure

### Recommended Controller Organization

```
backend/
├── controllers/
│   ├── products.controller.ts      # Product CRUD operations
│   ├── orders.controller.ts        # Order management
│   ├── reviews.controller.ts       # Review operations
│   ├── waitlist.controller.ts      # Waitlist management
│   ├── discountCodes.controller.ts # Discount code management
│   ├── admins.controller.ts        # Admin management
│   ├── auth.controller.ts          # Authentication
│   └── email.controller.ts         # Email operations
├── services/
│   ├── stripe.service.ts           # Stripe integration
│   ├── paypal.service.ts           # PayPal integration
│   ├── paystack.service.ts         # Paystack integration
│   ├── email.service.ts            # Email service
│   └── discount.service.ts         # Discount calculations
├── models/
│   ├── product.model.ts
│   ├── order.model.ts
│   ├── review.model.ts
│   ├── waitlist.model.ts
│   ├── discountCode.model.ts
│   └── admin.model.ts
├── middleware/
│   ├── auth.middleware.ts          # Authentication middleware
│   ├── admin.middleware.ts         # Admin authorization middleware
│   └── validation.middleware.ts   # Request validation
└── routes/
    ├── products.routes.ts
    ├── orders.routes.ts
    ├── reviews.routes.ts
    ├── waitlist.routes.ts
    ├── discountCodes.routes.ts
    ├── admins.routes.ts
    ├── auth.routes.ts
    └── email.routes.ts
```

---

### API Routes Structure

#### Products Routes

```
GET    /api/products              # Get all products
GET    /api/products/active       # Get active products only
GET    /api/products/:id          # Get product by ID
POST   /api/products              # Create product (admin only)
PUT    /api/products/:id          # Update product (admin only)
DELETE /api/products/:id         # Delete product (admin only)
PATCH  /api/products/:id/toggle   # Toggle active status (admin only)
```

#### Orders Routes

```
GET    /api/orders                # Get all orders (admin only)
GET    /api/orders/stats          # Get order statistics (admin only)
GET    /api/orders/status/:status # Get orders by status (admin only)
GET    /api/orders/:id            # Get order by ID (admin only)
POST   /api/orders                # Create order (public, for checkout)
PUT    /api/orders/:id/status     # Update order status (admin only)
PUT    /api/orders/:id/payment    # Update payment status (admin only)
```

#### Reviews Routes

```
GET    /api/reviews/product/:productId  # Get reviews for product
GET    /api/reviews/latest/:limit        # Get latest reviews
GET    /api/reviews/product/:productId/rating  # Get average rating
POST   /api/reviews                      # Add review (public)
```

#### Waitlist Routes

```
GET    /api/waitlist              # Get all entries (admin only)
GET    /api/waitlist/uncontacted  # Get uncontacted emails (admin only)
POST   /api/waitlist              # Add to waitlist (public)
DELETE /api/waitlist/:id         # Delete entry (admin only)
POST   /api/waitlist/mark-contacted  # Mark as contacted (admin only)
```

#### Discount Codes Routes

```
GET    /api/discount-codes                    # Get all codes (admin only)
GET    /api/discount-codes/active            # Get active codes (public)
GET    /api/discount-codes/:id               # Get code by ID (admin only)
POST   /api/discount-codes/validate         # Validate code (public)
POST   /api/discount-codes                  # Create code (admin only)
PUT    /api/discount-codes/:id              # Update code (admin only)
DELETE /api/discount-codes/:id             # Delete code (admin only)
PATCH  /api/discount-codes/:id/toggle       # Toggle active (admin only)
GET    /api/discount-codes/:id/usage        # Get usage history (admin only)
POST   /api/discount-codes/usage            # Record usage (public, on order)
```

#### Payment Routes

```
POST   /api/payments/stripe/checkout    # Create Stripe checkout session
GET    /api/payments/stripe/session    # Get Stripe session details
POST   /api/payments/paypal/order      # Create PayPal order (to be implemented)
POST   /api/payments/paypal/capture    # Capture PayPal payment (to be implemented)
POST   /api/payments/paystack/initialize  # Initialize Paystack payment (to be implemented)
GET    /api/payments/paystack/verify   # Verify Paystack payment (to be implemented)
```

#### Email Routes

```
POST   /api/email/send              # Send single email
POST   /api/email/bulk              # Send bulk email
POST   /api/email/test              # Send test email
POST   /api/email/order-confirmation    # Send order confirmation
POST   /api/email/order-status-update   # Send order status update
```

#### Auth Routes

```
POST   /api/auth/login              # Admin login
POST   /api/auth/logout             # Logout
GET    /api/auth/session            # Check session
GET    /api/auth/admin/check         # Check admin status
```

---

## Migration Checklist

### Phase 1: Database Setup
- [ ] Set up database (PostgreSQL, MongoDB, MySQL, etc.)
- [ ] Create database schema/tables for all collections
- [ ] Set up indexes for frequently queried fields
- [ ] Migrate existing data from Firestore

### Phase 2: Authentication
- [ ] Implement JWT-based authentication
- [ ] Create admin authentication endpoints
- [ ] Implement session management
- [ ] Migrate admin users from Firebase Auth

### Phase 3: Core APIs
- [ ] Implement Products API
- [ ] Implement Orders API
- [ ] Implement Reviews API
- [ ] Implement Waitlist API
- [ ] Implement Discount Codes API

### Phase 4: Payment Integration
- [ ] Implement Stripe backend integration
- [ ] Implement PayPal backend integration (currently client-side only)
- [ ] Implement Paystack backend integration (currently client-side only)
- [ ] Set up webhook handlers for payment providers

### Phase 5: Email Service
- [ ] Set up SMTP service
- [ ] Implement email sending endpoints
- [ ] Migrate email templates
- [ ] Test all email types

### Phase 6: Frontend Migration
- [ ] Update service files to use new API endpoints
- [ ] Replace Firebase SDK calls with HTTP requests
- [ ] Update authentication flow
- [ ] Test all functionality

### Phase 7: Security & Optimization
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Set up CORS properly
- [ ] Implement caching where appropriate
- [ ] Set up monitoring and logging

### Phase 8: Testing & Deployment
- [ ] Write integration tests
- [ ] Test all payment flows
- [ ] Test admin operations
- [ ] Load testing
- [ ] Deploy to production
- [ ] Monitor for issues

---

## Environment Variables

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# or
MONGODB_URI=mongodb://localhost:27017/dbname

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (to be implemented)
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox|live

# Paystack (to be implemented)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Huldah Gabriels

# Application
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development|production
```

---

## Notes

1. **Current State:**
   - PayPal and Paystack are currently client-side only
   - Backend integration recommended for security and reliability
   - Stripe is fully integrated on backend

2. **Security Considerations:**
   - All admin operations should require authentication
   - Payment operations should be server-side only
   - Rate limiting should be implemented
   - Input validation on all endpoints

3. **Performance:**
   - Consider caching for frequently accessed data (products, reviews)
   - Implement pagination for large datasets
   - Use database indexes for query optimization

4. **Webhooks:**
   - Implement Stripe webhooks for payment confirmation
   - Implement PayPal webhooks (when backend integration is done)
   - Implement Paystack webhooks (when backend integration is done)

5. **Email Templates:**
   - All email templates are HTML-based
   - Consider using a templating engine (Handlebars, EJS, etc.)
   - Personalization supported via string replacement

---

## Support

For questions or issues during migration, refer to:
- Individual service files in `src/services/`
- API endpoint implementations in `api/`
- Component usage in `src/components/`

---

**Last Updated:** 2025-01-27
**Version:** 1.0.0

