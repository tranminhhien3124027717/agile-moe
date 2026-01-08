# 🎓 Smart EdFund - Education Account Management System

> A comprehensive education account management system for Singapore Citizens aged 16-30, built with React, TypeScript, Firebase, and Tailwind CSS.

![Status](https://img.shields.io/badge/Status-Demo%20Ready-green)
![Node](https://img.shields.io/badge/Node-v18%2B-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## ⚠️ Important: Node.js Version

**Required**: Node.js v18 or higher (v20 LTS recommended)

If you're on Node v16, please upgrade first:

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from https://nodejs.org/
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Navigate to: http://localhost:5173

# 4. Seed demo data
# Admin Portal -> Seed Demo Data -> Click "Seed Database Now"
```

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Hướng dẫn bắt đầu nhanh (Vietnamese)
- **[FINAL_STATUS.md](./FINAL_STATUS.md)** - Tình trạng implementation & next steps
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Chi tiết technical
- **[FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md)** - Firebase migration guide

## ✨ Features

### Admin Portal (`/admin`)

- 📊 Dashboard with system statistics
- 👥 Account Management (CRUD operations)
- 💰 Top-up Management (batch & individual)
- 📚 Course Management
- 🎓 Enrollment Management
- 💳 Fee Processing
- 🔧 System Settings
- 🌱 Demo Data Seeding

### e-Service Portal (`/eservice`)

- 👤 Personal Dashboard
- 💵 Account Balance & History
- 📄 Course Fee Management
- 💳 Payment Processing (mock)
- ✏️ Profile Management
- ❓ Help & Support

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Firebase Firestore
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components
│   ├── shared/          # Shared components
│   └── ui/              # shadcn/ui components
├── contexts/            # React contexts
├── hooks/               # Custom hooks (Firebase-based)
├── lib/
│   ├── firebase.ts      # Firebase config
│   ├── firestoreServices.ts  # CRUD operations
│   ├── seedData.ts      # Mock data generator
│   └── utils.ts         # Utilities
├── pages/
│   ├── admin/           # Admin portal pages
│   └── eservice/        # e-Service portal pages
├── types/
│   └── firestore.ts     # TypeScript interfaces
└── App.tsx              # Main app component
```

## 🗄️ Database Collections

- `account_holders` - Student accounts
- `courses` - Available courses
- `enrollments` - Course enrollments
- `course_charges` - Fee records
- `transactions` - Transaction history
- `top_up_rules` - Top-up automation rules
- `top_up_schedules` - Scheduled top-ups

## 🎯 Key Features Implemented

### Payment Processing ✅

- Pay with Education Account balance
- Mock online payment
- Automatic balance deduction
- Transaction recording

### Top-up System ✅

- Configurable rules (age, balance, school status)
- Batch processing
- Individual top-ups
- Scheduled execution

### Account Management ✅

- Full CRUD operations
- Search and filtering
- Status management
- Balance tracking

### Course Management ✅

- Course creation and management
- Student enrollment
- Fee calculation
- Billing cycles

## 🧪 Demo Data

After seeding, you'll have:

- 10 Account Holders (various education levels)
- 7 Courses (from different institutions)
- 8 Enrollments
- 7 Course Charges (paid & pending)
- 7 Transactions
- 4 Top-up Rules

## 🔐 Firebase Configuration

Firebase credentials are configured in `src/lib/firebase.ts`.

For production, ensure Firestore rules are properly secured. Current rules allow all access for demo purposes.

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🐛 Known Issues & Solutions

### Issue: "crypto.getRandomValues is not a function"

**Solution**: Upgrade to Node.js v18+

### Issue: Blank page after start

**Solution**: Check browser console, verify Firebase config

### Issue: Data not showing

**Solution**: Seed data first via Admin Portal

## 🧑‍💻 Development

### Adding New Features

1. **Add Firestore Service**: Edit `src/lib/firestoreServices.ts`
2. **Create Hook**: Add to `src/hooks/`
3. **Build UI**: Create page in `src/pages/`
4. **Add Route**: Update `src/App.tsx`

### Field Naming Convention

- Firestore: camelCase (`dateOfBirth`, `inSchool`)
- Display: Title Case ("Date of Birth", "In School")

## 🎬 Demo Scenarios

### Scenario 1: Create Account & Top-up

```
Admin → Account Management → Create → Fill Form → Save
Admin → Top-up Management → Individual Top-up → Execute
```

### Scenario 2: Student Pays Fee

```
e-Service → Course Fees → Select Pending → Pay with Education Account
e-Service → Account Balance → View Updated Balance & Transaction
```

### Scenario 3: Batch Top-up

```
Admin → Top-up Management → Create Rule → Configure Criteria
Admin → Top-up Management → Schedule Batch → Execute
Admin → View Transaction History
```

## 📊 Testing Checklist

- [x] Seed demo data
- [x] View account holders
- [x] Create/edit/delete account
- [x] Create course
- [x] Enroll student
- [x] Process payment
- [x] Execute top-up
- [x] View transactions

## 🤝 Contributing

This is a demo project. For production use, implement:

- Proper authentication & authorization
- Data validation & sanitization
- Rate limiting
- Backup & recovery
- Monitoring & logging
- Security best practices

## 📄 License

This project is for demonstration purposes.

## 🆘 Support

For issues or questions:

1. Check documentation files
2. Review browser console errors
3. Verify Firebase configuration
4. Ensure Node.js v18+

---

**Built with ❤️ for education accessibility**

**Status**: ✅ Demo Ready | 🔄 Production Enhancements Pending

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
