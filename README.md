# E-Commerce Backend API

A comprehensive, production-ready e-commerce backend API built with Node.js and Express, designed to power online shopping platforms similar to Noon. This RESTful API provides complete functionality for managing products, orders, users, payments, and more.

## Table of Contents

- [Description / Overview](#description--overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Architecture / Folder Structure](#architecture--folder-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Tests](#tests)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## Description / Overview

This E-Commerce Backend API is a full-featured solution for building modern online shopping platforms. It provides robust endpoints for product management, user authentication, shopping cart operations, order processing, payment integration, and administrative functions.

### Who is this for?

- **Developers** building e-commerce applications
- **Businesses** looking to integrate a scalable e-commerce backend
- **Students** learning advanced Node.js and API development
- **Entrepreneurs** creating their online store platforms

### Why is it useful?

- ✅ **Complete Feature Set**: All essential e-commerce functionality in one place
- ✅ **Scalable Architecture**: Modular design that scales with your business
- ✅ **Secure Authentication**: JWT-based authentication and authorization
- ✅ **Payment Integration**: Stripe integration for seamless payments
- ✅ **Real-time Features**: Socket.io support for live updates
- ✅ **Image Management**: Cloudinary integration for efficient image storage
- ✅ **Production Ready**: Error handling, validation, and security best practices

## Features

### Core Modules

- ✅ **Products Management** - Create, read, update, delete products with image uploads
- ✅ **Categories & Sub-Categories** - Hierarchical product organization
- ✅ **Brands** - Brand management with categorization
- ✅ **User Management** - Registration, authentication, profile management
- ✅ **Address Management** - Multiple address support with city validation
- ✅ **Shopping Cart** - Add, update, remove items from cart
- ✅ **Coupons** - Discount coupon system with expiration and validation
- ✅ **Orders** - Complete order management and tracking
- ✅ **Reviews** - Product review and rating system
- ✅ **Payments** - Stripe integration for secure payment processing

### Technical Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Admin and user roles
- 📧 **Email Services** - Nodemailer integration for email notifications
- 📸 **Image Upload** - Cloudinary integration for cloud image storage
- 💳 **Payment Processing** - Stripe checkout sessions and payment intents
- 🔄 **Real-time Updates** - Socket.io for live notifications
- ✅ **Data Validation** - Joi schema validation
- 🛡️ **Error Handling** - Centralized error handling middleware
- ⏰ **Cron Jobs** - Automated tasks (e.g., coupon expiration)
- 📄 **Pagination** - Efficient data pagination with mongoose-paginate-v2

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Stripe Account** (for payment processing)
- **Cloudinary Account** (for image storage)
- **Email Service** (Gmail or other SMTP provider)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/e-commerce-app.git
cd e-commerce-app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
# Server Configuration
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# JWT Secrets
CONFIRM_SECRET=your_email_confirmation_secret_key
RE_CONFIRM_SECRET=your_reconfirmation_secret_key
LOGIN_SECRET=your_login_authentication_secret_key

# Password Hashing
SALT_ROUND=10

# Cloudinary Configuration (for image uploads)
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Stripe Configuration (for payments)
SECRET_STRIPE_KEY=sk_test_your_stripe_secret_key
CANCEL_URL=http://localhost:3000/cancel
SUCCESS_URL=http://localhost:3000/success

# File Upload Configuration
UPLOADS_FOLDER=uploads

# City API (for address validation)
CITY_API_KEY=your_city_api_key
```

### Step 4: Start the Server

```bash
# Development mode
node index.js

# Or with nodemon (if installed)
nodemon index.js
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Usage

### Starting the Application

```bash
# Install dependencies (first time only)
npm install

# Start the server
node index.js
```

### Authentication

Most endpoints require authentication. Include the JWT token in the request header:

```
Authorization: user_your_jwt_token_here
```

The token format is `user_` prefix followed by the JWT token.

## Configuration

### Environment Variables

All configuration is managed through environment variables in the `.env` file. Key configurations include:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | No (default: 3000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `CONFIRM_SECRET` | JWT secret for email confirmation | Yes |
| `RE_CONFIRM_SECRET` | JWT secret for email reconfirmation | Yes |
| `LOGIN_SECRET` | JWT secret for login tokens | Yes |
| `SALT_ROUND` | Bcrypt salt rounds | Yes |
| `CLOUD_NAME` | Cloudinary cloud name | Yes |
| `API_KEY` | Cloudinary API key | Yes |
| `API_SECRET` | Cloudinary API secret | Yes |
| `SECRET_STRIPE_KEY` | Stripe secret key | Yes |
| `CANCEL_URL` | Stripe cancel URL | Yes |
| `SUCCESS_URL` | Stripe success URL | Yes |
| `UPLOADS_FOLDER` | Local uploads folder name | Yes |
| `CITY_API_KEY` | City API key for address validation | Yes |

### File Upload Configuration

The API supports image uploads with the following configurations:
- **Allowed Extensions**: Images (jpg, png, gif, etc.)
- **Max Files**: 5 images per product
- **Storage**: Cloudinary cloud storage
- **Folder Structure**: Organized by category/subcategory/brand

### Payment Configuration

Stripe is configured for:
- Checkout sessions
- Payment intents
- Coupons integration
- Refunds

## Architecture / Folder Structure

```
e-commerce-app/
│
├── index.js                    # Main application entry point
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables (not in repo)
├── .gitignore                  # Git ignore rules
│
├── DB/                         # Database related files
│   ├── connection.js           # MongoDB connection setup
│   └── Models/                 # Mongoose models
│       ├── address.model.js
│       ├── brand.model.js
│       ├── cart.model.js
│       ├── category.model.js
│       ├── coupon.model.js
│       ├── global-setup.js
│       ├── index.js
│       ├── order.model.js
│       ├── product.model.js
│       ├── reviews.model.js
│       ├── sub-category.model.js
│       └── user.model.js
│
├── src/
│   ├── Middlewares/            # Express middlewares
│   │   ├── authentication.middleware.js
│   │   ├── autherization.middleware.js
│   │   ├── error-handling.middleware.js
│   │   ├── finders.middleware.js
│   │   ├── index.js
│   │   ├── multer.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── Modules/                # Feature modules (MVC pattern)
│   │   ├── Address/
│   │   │   ├── address.controller.js
│   │   │   └── address.routes.js
│   │   ├── Brand/
│   │   │   ├── brands.controller.js
│   │   │   └── brands.routes.js
│   │   ├── Cart/
│   │   │   ├── cart.controller.js
│   │   │   ├── cart.routes.js
│   │   │   └── Utils/
│   │   │       └── cart.utils.js
│   │   ├── Categories/
│   │   │   ├── categories.controller.js
│   │   │   └── categories.routes.js
│   │   ├── Coupon/
│   │   │   ├── coupon.controller.js
│   │   │   ├── coupon.routes.js
│   │   │   └── coupon.schema.js
│   │   ├── Order/
│   │   │   ├── order.controller.js
│   │   │   ├── order.routes.js
│   │   │   ├── order.schema.js
│   │   │   └── Utils/
│   │   │       └── coupon-validation.utils.js
│   │   ├── Products/
│   │   │   ├── products.controller.js
│   │   │   └── products.routes.js
│   │   ├── Reviews/
│   │   │   ├── reviews.controller.js
│   │   │   └── reviews.routes.js
│   │   ├── Sub-Categories/
│   │   │   ├── sub-categories.controller.js
│   │   │   ├── sub-categories.routes.js
│   │   │   └── sub-categories.schemaValidation.js
│   │   ├── User/
│   │   │   ├── user.controller.js
│   │   │   └── user.routes.js
│   │   └── index.js            # Module exports
│   │
│   ├── Payment-Handler/        # Payment processing
│   │   └── stripe.js
│   │
│   ├── Services/               # External services
│   │   └── sendEmail.service.js
│   │
│   └── Utils/                  # Utility functions
│       ├── Api_Feature.utils.js
│       ├── calculate-price.utils.js
│       ├── cloudinary.utils.js
│       ├── crons.utils.js
│       ├── enums.utils.js
│       ├── error-class.utils.js
│       ├── file-extenstions.utils.js
│       ├── general-rules.utils.js
│       ├── index.js
│       ├── socket.io.utils.js
│       └── system-roles.utils.js
│
└── FE_ecomm/                   # Frontend demo (optional)
    ├── index.html
    ├── index.js
    └── package.json
```

### Design Patterns

- **MVC Architecture**: Separation of routes, controllers, and models
- **Module Pattern**: Feature-based module organization
- **Middleware Pattern**: Reusable middleware functions
- **Utility Functions**: Shared helper functions

## API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/user/signUp` | Register new user | No |
| POST | `/user/login` | User login | No |
| GET | `/user/confirmEmail/:token` | Confirm email address | No |
| GET | `/user/refreshConfirmation/:rfToken` | Resend confirmation email | No |
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/update` | Update user account | Yes |
| PATCH | `/user/sendCode` | Send password reset code | Yes |
| PATCH | `/user/resetPassword` | Reset password | Yes |
| PATCH | `/user/delete` | Delete user account | Yes |

### Product Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/products/create` | Create new product | Yes | Yes |
| GET | `/products/list` | Get all products | No | No |
| PUT | `/products/update/:productId` | Update product | Yes | Yes |
| DELETE | `/products/delete/:productId` | Delete product | Yes | Yes |

### Category Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/categories/create` | Create category | Yes | Yes |
| GET | `/categories/list` | Get all categories | No | No |
| PUT | `/categories/update/:categoryId` | Update category | Yes | Yes |
| DELETE | `/categories/delete/:categoryId` | Delete category | Yes | Yes |

### Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/cart/add` | Add item to cart | Yes |
| GET | `/cart/get` | Get user cart | Yes |
| PUT | `/cart/update` | Update cart item | Yes |
| DELETE | `/cart/delete/:productId` | Remove item from cart | Yes |
| DELETE | `/cart/clear` | Clear entire cart | Yes |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/order/create` | Create new order | Yes |
| GET | `/order/list` | Get user orders | Yes |
| GET | `/order/:orderId` | Get order details | Yes |
| PATCH | `/order/cancel/:orderId` | Cancel order | Yes |

### Coupon Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/coupon/create` | Create coupon | Yes | Yes |
| GET | `/coupon/list` | Get all coupons | Yes | Yes |
| PUT | `/coupon/update/:couponId` | Update coupon | Yes | Yes |
| DELETE | `/coupon/delete/:couponId` | Delete coupon | Yes | Yes |

### Address Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/address/create` | Add new address | Yes |
| GET | `/address/list` | Get user addresses | Yes |
| PUT | `/address/update/:addressId` | Update address | Yes |
| DELETE | `/address/delete/:addressId` | Delete address | Yes |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/review/create` | Create product review | Yes |
| GET | `/review/list` | Get product reviews | No |
| PUT | `/review/update/:reviewId` | Update review | Yes |
| DELETE | `/review/delete/:reviewId` | Delete review | Yes |



### Code Style

- Use ES6+ JavaScript features
- Follow consistent naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep functions focused and modular

### Reporting Issues

If you find a bug or have a suggestion, please open an issue with:
- Clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details

## Roadmap

### Planned Features

- [ ] **Wishlist Module** - Save favorite products for later
- [ ] **Advanced Search** - Full-text search with filters
- [ ] **Product Recommendations** - AI-based product suggestions
- [ ] **Inventory Management** - Stock tracking and alerts
- [ ] **Multi-currency Support** - Support for different currencies
- [ ] **Shipping Integration** - Shipping provider APIs
- [ ] **Analytics Dashboard** - Sales and user analytics
- [ ] **Email Templates** - Rich HTML email templates
- [ ] **Caching Layer** - Redis integration for performance
- [ ] **Rate Limiting** - API rate limiting middleware
- [ ] **Comprehensive Test Suite** - Unit and integration tests
- [ ] **API Documentation** - Swagger/OpenAPI documentation
- [ ] **Docker Support** - Containerization for easy deployment
- [ ] **CI/CD Pipeline** - Automated testing and deployment

### Improvements

- [ ] Enhanced error messages
- [ ] Request validation improvements
- [ ] Performance optimization
- [ ] Security enhancements
- [ ] Database query optimization
- [ ] API response time improvements

## Acknowledgments

### Technologies & Libraries

- **[Express.js](https://expressjs.com/)** - Web application framework
- **[MongoDB](https://www.mongodb.com/)** - Database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[JWT](https://jwt.io/)** - Authentication tokens
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Cloudinary](https://cloudinary.com/)** - Image management
- **[Socket.io](https://socket.io/)** - Real-time communication
- **[Joi](https://joi.dev/)** - Data validation
- **[Nodemailer](https://nodemailer.com/)** - Email sending
- **[Multer](https://github.com/expressjs/multer)** - File uploads
- **[Bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing

