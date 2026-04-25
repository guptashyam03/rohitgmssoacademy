# 📘 EdTech Notes & Content Selling Platform — Final Spec

---

## 🏗️ Core Modules

### 1. Authentication & User Management

* Email/password login
* OAuth (Google, GitHub)
* Role-based access: Admin, Instructor, Student
* Profile management (avatar, bio, purchase history)
* Email verification & password reset

---

## 🗂️ Storage & Content

* **PDF Notes**

  * Stored on Google Drive
  * Served via shareable links or iframe embed
  * Optional preview (first few pages)

* **Video Lectures**

  * Hosted on YouTube (unlisted)
  * Embedded player inside platform

* **Mock Tests**

  * Bulk upload via CSV/Excel
  * Parsed and stored in database
  * Supports MCQ & True/False

* **Content Structuring**

  * Tags, categories, descriptions
  * Bundle support (PDF + Video + Tests)

---

## 🛍️ Storefront / Discovery

* Landing page with featured content
* Search & filters (subject, price, type)
* Content detail page with preview
* Wishlist / Save for later

---

## 💳 Purchase Plans / Access Tiers

| Plan                     | Access                              |
| ------------------------ | ----------------------------------- |
| PDF Notes Only           | Access to PDFs                      |
| Mock Test Only           | Access to mock tests                |
| Video Lectures (Premium) | Full access (PDFs + Videos + Tests) |
| Manual Admin Grant       | Custom access override by admin     |

---

## 💳 Payments & Monetization

* Razorpay integration (one-time purchase per plan)
* Secure webhook handling for payment confirmation
* Auto-activation of plan on success
* Coupon / discount support
* Admin override (grant/revoke access manually)

---

## 🎓 Student Dashboard

* **My Library**

  * Purchased PDFs, videos, tests

* **PDF Viewer**

  * In-browser viewing (iframe/Drive embed)
  * Optional download restriction

* **Video Player**

  * Embedded YouTube player
  * Track progress (optional)

* **Mock Tests**

  * Attempt → Submit → Instant results
  * Score + detailed answer review
  * Explanation per question
  * Attempt history tracking

---

## 🧑‍💼 Admin Panel

* Content management (PDFs, videos, tests)

* Bulk MCQ upload (CSV/Excel)

  * Downloadable template
  * Auto parsing & validation

* User management

  * Grant/revoke access plans manually

* Coupon management

* Orders & revenue dashboard

* Student enrollment insights

---

## 🧠 Mock Test Engine

* Question bank system
* Timer-based tests
* Auto grading
* Negative marking (optional)
* Pass/fail cutoff
* Attempt history with analytics

---

## 🔒 Security & Access Control

* Google Drive controlled sharing (restricted access)
* JWT-based authentication
* Role-based authorization
* Prevent unauthorized content access via backend validation
* Optional:

  * Disable right-click (basic DRM-lite)
  * Watermarking PDFs (future enhancement)

---

## 📊 Analytics

* Revenue tracking
* Most purchased plans
* Test performance insights
* User activity metrics

---

## 🛠️ Suggested Tech Stack

| Layer    | Technology                             |
| -------- | -------------------------------------- |
| Frontend | Next.js + Tailwind CSS                 |
| Backend  | Next.js API Routes / Node.js (Express) |
| Database | PostgreSQL (Prisma ORM)                |
| Storage  | Google Drive                           |
| Payments | Razorpay                               |
| Auth     | NextAuth.js                            |
| Video    | YouTube Embed                          |
| Hosting  | Vercel + Railway/Render                |

---

## 🚀 Phase 2 Enhancements

* Affiliate / referral system
* Discussion forums
* Certificates
* Mobile app (React Native)
* Email marketing integration
* Multi-language support

---

## ✅ Notes

* Platform uses **plan-based access control**, not per-item purchases
* Admin retains full control over user access regardless of payment
* Focus on simplicity, scalability, and low infrastructure cost using external platforms (Drive + YouTube)

---
