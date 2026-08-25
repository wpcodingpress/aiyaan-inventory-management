# সম্পূর্ণ Deployment Guide (বাংলায়)

> **Ayan's Crafts Inventory Management System**
> এই গাইডে আমরা ধাপে ধাপে দেখাবো কিভাবে Vercel + Aiven MySQL + GitHub এ আমাদের অ্যাপ ডিপ্লয় করবে।

---

## 📋 যা যা লাগবে

1. **GitHub Account** — কোড রাখার জন্য
2. **Vercel Account** — অ্যাপ হোস্ট করার জন্য (GitHub দিয়ে সাইন আপ করো)
3. **Aiven Account** — MySQL Database রাখার জন্য
4. **Node.js** — কম্পিউটারে ইনস্টল থাকতে হবে (v18+)

---

## 🟢 ধাপ ১: GitHub এ Repository তৈরি করো

### ১.১ GitHub এ নতুন Repository তৈরি করো

1. [github.com](https://github.com) এ যাও
2. ডান পাশে **"New"** বাটনে ক্লিক করো
3. Repository name দাও: `aiyaan-inventory-management`
4. **Public** বা **Private** — যেটা চাও সেটা রাখো (Private recommended)
5. "Create repository" এ ক্লিক করো
6. **খালি রেপো তৈরি হলো** — README, .gitignore, কিছু না রাখো

### ১.২ লোকাল কম্পিউটার থেকে Push করো

তোমার প্রজেক্ট ফোল্ডারে যাও (`C:\Users\Asus\Documents\GitHub\aiyaan-inventory-management`) এবং এই commands চালাও:

```powershell
# Git Initialize (যদি এখনো করা না থাকে)
git init

# সব ফাইল Add করো
git add .

# First Commit করো
git commit -m "Initial commit: Ayan's Crafts Inventory Management System"

# GitHub-এ Connect করো (তোমার GitHub username দাও)
git remote add origin https://github.com/YOUR-USERNAME/aiyaan-inventory-management.git

# Push করো
git branch -M main
git push -u origin main
```

> **গুরুত্বপূর্ণ:** `YOUR-USERNAME` এর জায়গায় তোমার আসল GitHub username বসাও।

**✅ চেক:** GitHub এ গিয়ে দেখো সব ফাইল আছে কিনা — `.env`, `prisma/schema.prisma`, `app/`, `components/`, ইত্যাদি।

---

## 🔵 ধাপ ২: Aiven MySQL Database তৈরি করো

### ২.১ Aiven Account তৈরি

1. [aiven.io](https://aiven.io) এ যাও
2. **Sign Up** এ ক্লিক করো
3. Google/GitHub দিয়ে সাইন আপ করো (সবচেয়ে সহজ)
4. যদি প্রথমবার সাইন আপ করো, তাহলে **$30 free credit** পাবে — যথেষ্ট!

### ২.২ নতুন Database Service তৈরি করো

1. Aiven Dashboard-এ যাও
2. **"+ Create Service"** বাটনে ক্লিক করো
3. **MySQL** সিলেক্ট করো
4. এই settings দাও:

```
Service Name:    ayans-crafts-db
Database:        ayans_crafts
Cloud Provider:  Google Cloud (বা যেটা পছন্দ)
Region:          us-central1 (বা তোমার কাছের কোনোটা)
Plan:            Free (Sandbox)
```

5. **"Create Service"** এ ক্লিক করো
6. **১-২ মিনিট অপেক্ষা করো** — Database তৈরি হচ্ছে

### ২.৩ Database Connection URL নাও

1. Service তৈরি হয়ে গেলে, সার্ভিসের উপর ক্লিক করো
2. **"Overview"** tab-এ যাও
3. **"Connection URL"** খুঁজে বের করো — এরকম কিছু দেখাবে:

```
mysql://avnadmin:XXXXXXXXXX@ayans-crafts-db-xxx.aivencloud.com:12345/defaultdb?ssl=true
```

4. **এই URL কপি করো** — এটা পরে লাগবে!

### ২.৪ SSL Certificate Download করো (গুরুত্বপূর্ণ!)

1. Aiven Dashboard → তোমার সার্ভিস → **"Overview"** tab
2. নিচে **"Download CA Certificate"** এ ক্লিক করো
3. ফাইলটা সেভ করো — পরে লাগবে

> **মনে রাখো:** Aiven MySQL default-এ SSL চায়। তাই connection URL তে `?ssl=true` থাকবে।

**✅ চেক:** Aiven Dashboard-এ সার্ভিস status **"Running"** দেখাচ্ছে কিনা?

---

## 🟣 ধাপ ৩: Vercel এ Deploy করো

### ৩.১ Vercel Account তৈরি

1. [vercel.com](https://vercel.com) এ যাও
2. **"Sign Up"** এ ক্লিক করো
3. **"Continue with GitHub"** সিলেক্ট করো
4. GitHub permission দাও — Vercel তোমার repos দেখতে পারবে

### ৩.২ নতুন Project তৈরি করো

1. Vercel Dashboard-এ **"+ Add New..." → "Project"** এ ক্লিক করো
2. **"Import Git Repository"** সেকশনে তোমার `aiyaan-inventory-management` repo খুঁজে বের করো
3. **"Import"** এ ক্লিক করো

### ৩.৩ Environment Variables সেট করো (সবচেয়ে গুরুত্বপূর্ণ!)

Project import করার পর "Configure Project" পেজে যাও। এখানে **Environment Variables** সেকশনে এইগুলো যোগ করো:

#### Variable ১: DATABASE_URL
```
Name:  DATABASE_URL
Value: mysql://avnadmin:YOUR_PASSWORD@YOUR_HOST:PORT/defaultdb?ssl=true
```

> **⚠️ সতর্কতা:** এই URL টা Aiven থেকে কপি করা। এতে `?ssl=true` থাকতে হবে!

#### Variable ২: NEXTAUTH_SECRET
```
Name:  NEXTAUTH_SECRET
Value: (একটা random secret key বানাও — নিচে দেওয়া method ব্যবহার করো)
```

**Random Secret Key বানানোর উপায়:**

PowerShell-এ এই command চালাও:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

এটা একটা random string দেবে, সেটা কপি করে `NEXTAUTH_SECRET` এর value হিসেবে বসাও।

#### Variable ৩: NEXTAUTH_URL
```
Name:  NEXTAUTH_URL
Value: https://YOUR-PROJECT-NAME.vercel.app
```

> `YOUR-PROJECT-NAME` এর জায়গায় তোমার Vercel project name বসাও।
> Vercel auto-detect করতে পারে, তাই এটা optional হতে পারে।

#### Variable ৪: NEXT_PUBLIC_APP_NAME
```
Name:  NEXT_PUBLIC_APP_NAME
Value: Ayan's Crafts - Inventory Management
```

#### Variable ৫: NEXT_PUBLIC_APP_URL
```
Name:  NEXT_PUBLIC_APP_URL
Value: https://YOUR-PROJECT-NAME.vercel.app
```

#### Variable ৬: NEXT_PUBLIC_DEFAULT_CURRENCY
```
Name:  NEXT_PUBLIC_DEFAULT_CURRENCY
Value: BDT
```

#### Variable ৭: NEXT_PUBLIC_DEFAULT_CURRENCY_SYMBOL
```
Name:  NEXT_PUBLIC_DEFAULT_CURRENCY_SYMBOL
Value: ৳
```

### ৩.৪ Deploy!

1. সব variables যোগ করার পর **"Deploy"** বাটনে ক্লিক করো
2. **২-৫ মিনিট অপেক্ষা করো** — প্রথম build একটু সময় নেবে
3. Build log দেখো — কোনো error আছে কিনা
4. **"Ready"** দেখালে — Deploy সফল!

**✅ চেক:** Vercel Dashboard-এ deployment status **"Ready"** দেখাচ্ছে?

---

## 🟡 ধাপ ৪: Database Migration + Seed

Deploy হয়ে গেলেও, এখনো database-এ tables নেই। এখন সেটা তৈরি করবো।

### ৪.১ Vercel Terminal ব্যবহার করো

**উপায় ১: Vercel CLI দিয়ে (Recommended)**

প্রথমে Vercel CLI ইনস্টল করো:
```powershell
npm i -g vercel
```

তারপর প্রজেক্ট ফোল্ডারে যেয়ে:
```powershell
# Vercel Login
vercel login

# Production environment-এ connect করো
vercel env pull .env.local
```

এরপর `.env.local` ফাইল খুঁজে Aiven-এর DATABASE_URL কপি করে local `.env` তে বসাও।

তারপর এই commands চালাও:
```powershell
# Database-এ tables তৈরি করো
npx prisma migrate dev --name init

# Seed data ঢোকাও
npx prisma db seed

# Production database-এ push করো
npx prisma db push
```

**উপায় ২: Aiven Dashboard থেকে ম্যানুয়ালি (Alternative)**

যদি Vercel CLI না চলে:

1. Aiven Dashboard → তোমার Service → **"Query Console"** tab
2. নিচের SQL statements গুলো একে একে run করো:

```sql
-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo VARCHAR(255),
  favicon VARCHAR(255),
  primaryColor VARCHAR(50) NOT NULL DEFAULT '#4f46e5',
  secondaryColor VARCHAR(50) NOT NULL DEFAULT '#565e74',
  currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
  currencySymbol VARCHAR(10) NOT NULL DEFAULT '৳',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Dhaka',
  dateFormat VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
  businessType VARCHAR(50),
  contactEmail VARCHAR(255),
  contactPhone VARCHAR(50),
  address TEXT,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

> **⚠️ তবে সবচেয়ে সহজ উপায়:** `npx prisma migrate dev --name init` চালানো। Prisma auto-matically সব tables তৈরি করে দেবে।

### ৪.২ Seed Data ঢোকানো

```powershell
npx prisma db seed
```

এই command চালালে:
- ১টি Organization (Ayan's Crafts)
- ৪টি Role (Admin, Manager, Sales Staff, Viewer)
- ১টি Admin User
- ৪টি Category (Formal, Casual, Boots, Sandals)
- ২টি Brand
- ৬টি Product, ২০টি Variant
- ৩টি Supplier
- ৩টি Customer
- ২টি Purchase Order
- ৩টি Sale
- ৩টি Expense

Database-এ ঢুকে যাবে!

**✅ চেক:** Seed সফল হলে terminal-এ দেখাবে:
```
Seed completed successfully!
─────────────────────────────────────────
Organization: Ayan's Crafts
Admin Login:  admin@aiyaanscrafts.com / admin123
```

---

## 🟠 ধাপ ৫: Production-এ Redeploy করো

Seed করার পর Vercel-এ একবার আবার deploy করো (নতুন environment variables সহ):

1. Vercel Dashboard → তোমার Project
2. **"Deployments"** tab
3. সবচেয়ে উপরের deployment-এর ডান পাশে **"⋮"** (three dots)
4. **"Redeploy"** সিলেক্ট করো
5. **"Redeploy"** বাটনে ক্লিক করো

**✅ চেক:** Deploy সফল হলে তোমার URL দিয়ে অ্যাপ খুলে দেখো।

---

## 🟢 ধাপ ৬: Verify করো — সব কাজ করছে কিনা?

তোমার deployed URL এ যাও (যেমন: `https://your-project.vercel.app`)

### ৬.১ Login Test
1. Sign In page আসবে
2. Email: `admin@aiyaanscrafts.com`
3. Password: `admin123`
4. **"Sign In"** এ ক্লিক করো
5. ✅ Dashboard খুলে উঠলে = Login কাজ করছে!

### ৬.২ Dashboard Check
- ✅ KPI Cards (Total Revenue, Gross Profit, Inventory Value, Low Stock) দেখাচ্ছে?
- ✅ Revenue chart দেখাচ্ছে?
- ✅ Low Stock Alerts দেখাচ্ছে?
- ✅ Recent Sales table দেখাচ্ছে?

### ৬.৩ Products Check
- Sidebar থেকে "Products" এ যাও
- ✅ ৬টি Product দেখাচ্ছে?
- ✅ Category, Brand, Price, Stock info দেখাচ্ছে?

### ৬.৪ Inventory Check
- "Inventory" এ যাও
- ✅ Stock levels দেখাচ্ছে?
- ✅ Low Stock / Out of Stock items highlight হচ্ছে?

### ৬.৫ Sales Check
- "Sales" এ যাও
- ✅ ৩টি Sales Order দেখাচ্ছে?
- ✅ Customer name, amount, status দেখাচ্ছে?

### ৬.৬ Finance Check
- "Finance" এ যাও
- ✅ Revenue, COGS, Profit margins দেখাচ্ছে?

### ৬.৭ Settings Check
- "Settings" এ যাও
- ✅ Ayan's Crafts info দেখাচ্ছে?
- ✅ Users page এ ৪জন user দেখাচ্ছে?

---

## 🔴 সমস্যা হলে (Troubleshooting)

### "Prisma Client not found"
```powershell
npx prisma generate
```

### "Connection refused" বা "ECONNREFUSED"
- DATABASE_URL সঠিক কিনা চেক করো
- `?ssl=true` আছে কিনা চেক করো
- Aiven service **"Running"** আছে কিনা চেক করো

### "Table doesn't exist"
```powershell
npx prisma migrate dev --name init
npx prisma db seed
```

### Build Error
Vercel Dashboard → Deployments → Build Logs দেখো — কোন line-এ error আসছে সেটা দেখো।

### "NEXTAUTH_URL" error
Vercel Environment Variables-এ `NEXTAUTH_URL` সঠিক URL দিয়ে সেট করো:
```
https://your-project-name.vercel.app
```

---

## 📌 Quick Reference Card

| কাজ | Command |
|------|---------|
| Dev server চালু করো | `npm run dev` |
| Build করো | `npm run build` |
| Database migrate | `npx prisma migrate dev --name init` |
| Database push | `npx prisma db push` |
| Seed data ঢোকাও | `npx prisma db seed` |
| Prisma Studio খোলো | `npx prisma studio` |
| Prisma generate | `npx prisma generate` |
| Vercel deploy | `vercel --prod` |

---

## 🔐 Default Login Credentials

| Field | Value |
|-------|-------|
| Email | `admin@aiyaanscrafts.com` |
| Password | `admin123` |

> **⚠️ প্রথম deploy এর পর পাসওয়ার্ড পরিবর্তন করো!**

---

*তৈরি করেছে: WPCodingPress | Ayan's Crafts Inventory Management System*
