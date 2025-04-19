# 🏰 FlowUp Backend - Project Overview

## 📌 Project Description

FlowUp's backend is built using **NestJS** and **PostgreSQL**, providing a scalable and secure API for authentication, user management, and role-based access control (RBAC). Our backend focuses on delivering a robust authentication system with social login capabilities and automated deployment processes.

---

## 🌟 Current Features

- **JWT Authentication:** Secure login, registration, and password recovery
- **Social Login:** Authentication via Google (Apple coming soon)
- **Role-Based Access Control (RBAC):** User roles and permissions management
- **CI/CD Pipeline:** Automated testing and deployment

---

## 📌 Implementation Status

- [x] **JWT Authentication** - Completed (Login, Register, Password Reset)
- [x] **Google OAuth Integration** - Completed
- [ ] **Apple Sign-in** - In Progress
- [x] **Basic RBAC System** - Completed
- [x] **CI/CD Pipeline** - Basic setup completed

---

## 🌜 API Documentation

📌 **Base URL:** `http://localhost:3000` (Development)
📌 **Swagger URL:** `http://localhost:3000/api-json` (Development)

### 🔐 Authentication Routes (`/auth`)

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| `POST` | `/auth/register`        | Register new user      |
| `POST` | `/auth/login`           | User login             |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password`  | Reset password         |
| `GET`  | `/auth/me`              | Get current user       |
| `POST` | `/auth/logout`          | Logout user            |
| `POST` | `/auth/social/login`    | Social login           |
| `POST` | `/auth/social/signup`   | Social signup          |
| `GET`  | `/auth/google`          | Google OAuth login     |
| `GET`  | `/auth/google/callback` | Google OAuth callback  |
| `GET`  | `/auth/apple`           | Apple OAuth login      |
| `POST` | `/auth/apple/callback`  | Apple OAuth callback   |

### 👥 User Management (`/users`)

| Method   | Endpoint                  | Description           |
| -------- | ------------------------- | --------------------- |
| `GET`    | `/users/profile`          | Get user profile      |
| `GET`    | `/users/test-permissions` | Test user permissions |
| `POST`   | `/users`                  | Create new user       |
| `GET`    | `/users`                  | Get all users         |
| `GET`    | `/users/:id`              | Get user by ID        |
| `PATCH`  | `/users/:id`              | Update user           |
| `DELETE` | `/users/:id`              | Delete user           |

### 👑 Roles Management (`/roles`)

| Method   | Endpoint     | Description     |
| -------- | ------------ | --------------- |
| `GET`    | `/roles`     | Get all roles   |
| `GET`    | `/roles/:id` | Get role by ID  |
| `POST`   | `/roles`     | Create new role |
| `PUT`    | `/roles/:id` | Update role     |
| `DELETE` | `/roles/:id` | Delete role     |

### 🔑 Permissions Management (`/permissions`)

| Method   | Endpoint           | Description          |
| -------- | ------------------ | -------------------- |
| `POST`   | `/permissions`     | Create permission    |
| `GET`    | `/permissions`     | Get all permissions  |
| `GET`    | `/permissions/:id` | Get permission by ID |
| `PUT`    | `/permissions/:id` | Update permission    |
| `DELETE` | `/permissions/:id` | Delete permission    |

### 🏢 Business Management (`/businesses`)

| Method   | Endpoint          | Description        |
| -------- | ----------------- | ------------------ |
| `POST`   | `/businesses`     | Create business    |
| `GET`    | `/businesses`     | Get all businesses |
| `GET`    | `/businesses/:id` | Get business by ID |
| `PUT`    | `/businesses/:id` | Update business    |
| `DELETE` | `/businesses/:id` | Delete business    |

### 🏭 Business Types (`/business-types`)

| Method   | Endpoint              | Description             |
| -------- | --------------------- | ----------------------- |
| `GET`    | `/business-types`     | Get all business types  |
| `GET`    | `/business-types/:id` | Get business type by ID |
| `POST`   | `/business-types`     | Create business type    |
| `PUT`    | `/business-types/:id` | Update business type    |
| `DELETE` | `/business-types/:id` | Delete business type    |

---

## ⚙️ Tech Stack

- **NestJS** - Backend framework
- **PostgreSQL** - Primary database
- **TypeORM** - Database ORM
- **Passport.js** - Authentication middleware
- **GitHub Actions** - CI/CD

---

## 🛠️ Development Setup

### **1️⃣ Clone the Repository**
# FlowUp-Api
