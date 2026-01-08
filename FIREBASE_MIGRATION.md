# Smart EdFund - Firebase Migration Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js v18 or higher** (v20 recommended)
- npm or bun package manager

### Installation & Setup

1. **Update Node.js version** (if you're on v16)

   ```bash
   # Using nvm (recommended)
   nvm install 20
   nvm use 20

   # Or download from https://nodejs.org/
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Seed demo data**
   - Navigate to http://localhost:5173
   - Login to Admin Portal
   - Go to "Seed Demo Data" in sidebar
   - Click "Seed Database Now"

## 📁 Project Structure (Firebase Migration)

### New Firebase Files

```
src/
├── lib/
│   ├── firebase.ts              # Firebase initialization
│   ├── firestoreServices.ts     # Firestore CRUD operations
│   └── seedData.ts              # Mock data seeding
├── types/
│   └── firestore.ts             # TypeScript types for Firestore
└── hooks/
    ├── useAccountHolders-firebase.ts
    ├── useCourses-firebase.ts
    ├── useEnrollments-firebase.ts
    ├── useCourseCharges-firebase.ts
    ├── useTransactions-firebase.ts
    └── useTopUp-firebase.ts
```

### Migration Status

#### ✅ Completed

- Firebase/Firestore setup
- Data types definition
- CRUD services for all collections
- React hooks with react-query
- Mock data seeding system
- Seed data admin page

#### 🔄 To Do (Next Steps)

1. **Replace hooks in existing pages**

   - Change imports from `useAccountHolders.ts` to `useAccountHolders-firebase.ts`
   - Update all admin pages
   - Update all e-service pages

2. **Update CurrentUserContext**

   - Modify to select random user from Firestore
   - Remove Supabase dependencies

3. **Complete missing features in UI**
   - Admin: Full CRUD operations for accounts, courses, enrollments
   - Admin: Batch & individual top-up functionality
   - Admin: Course fee processing
   - e-Service: Payment flow (mock implementation)
   - e-Service: Profile editing

## 🔧 How to Migrate Pages

### Example: Updating a page to use Firebase

**Before (using Supabase):**

```typescript
import { useAccountHolders } from "@/hooks/useAccountHolders";

export default function AccountManagement() {
  const { data: accounts, isLoading } = useAccountHolders();
  // ...
}
```

**After (using Firebase):**

```typescript
import { useAccountHolders } from "@/hooks/useAccountHolders-firebase";

export default function AccountManagement() {
  const { data: accounts, isLoading } = useAccountHolders();
  // ...
}
```

### Field Name Changes

When migrating, note the camelCase conversion:

| Supabase (snake_case) | Firebase (camelCase) |
| --------------------- | -------------------- |
| date_of_birth         | dateOfBirth          |
| residential_address   | residentialAddress   |
| mailing_address       | mailingAddress       |
| in_school             | inSchool             |
| education_level       | educationLevel       |
| continuing_learning   | continuingLearning   |
| created_at            | createdAt            |
| updated_at            | updatedAt            |
| closed_at             | closedAt             |

## 📊 Firestore Collections

### Collections Structure

```
Firestore Database
├── account_holders
├── courses
├── enrollments
├── course_charges
├── transactions
├── top_up_rules
└── top_up_schedules
```

### Sample Data Included

After seeding, you'll have:

- 10 sample students with varying statuses
- 7 active courses from different institutions
- 8 enrollments linking students to courses
- 7 fee charges (pending and paid)
- 7 transaction records
- 4 configurable top-up rules

## 🎯 Key Features Implemented

### 1. Account Management

- Create/Update/Delete account holders
- Search and filter by status, school status
- View account details and balance

### 2. Course Management

- CRUD operations for courses
- View enrolled students per course
- Track course fees

### 3. Enrollment Management

- Enroll students in courses
- Track enrollment status
- View course history

### 4. Fee Processing

- Generate course charges
- Process payments (Education Account or Online)
- Track payment history

### 5. Top-up System

- Create configurable top-up rules based on:
  - Age range
  - Balance range
  - School status
  - Education level
  - Continuing learning status
- Execute batch top-ups
- Schedule individual top-ups
- Track top-up history

### 6. Transactions

- Complete transaction history
- Filter by account
- Track balance changes

## 🔐 Firebase Configuration

The project is configured with Firebase credentials in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBVMbZZ6yk2v4_GWRcY5hJ3cUo-gsKytkM",
  authDomain: "test-844af.firebaseapp.com",
  projectId: "test-844af",
  // ...
};
```

## 💡 Implementation Notes

### Payment Flow (Mock)

- **Education Account**: Deducts from account balance, creates transaction
- **Online Payment**: Marks as paid, creates transaction (no actual payment gateway)
- Both methods update charge status to 'paid' and invalidate relevant queries

### Top-up Execution

- **Individual**: Direct top-up to specific account
- **Batch**: Evaluates all accounts against rule criteria, tops up eligible accounts
- Automatic transaction creation for audit trail

### Data Relationships

- Enrollments link accounts to courses
- Course charges reference both account and course
- Transactions maintain account balance history
- Top-up schedules can reference rules for batch processing

## 🐛 Troubleshooting

### Issue: "crypto.getRandomValues is not a function"

**Solution**: Upgrade to Node.js v18 or higher

### Issue: "Cannot find module '@tanstack/react-query'"

**Solution**: Run `npm install` or `bun install`

### Issue: Firestore permission denied

**Solution**: Ensure Firestore rules allow read/write access (for demo purposes)

## 📝 TODO List for Complete Migration

- [ ] Update all admin pages to use Firebase hooks
- [ ] Update all e-service pages to use Firebase hooks
- [ ] Implement CurrentUserContext with random user selection
- [ ] Remove all Supabase imports and dependencies
- [ ] Add form validation for all create/edit forms
- [ ] Implement search and filtering in all list pages
- [ ] Add pagination for large datasets
- [ ] Complete the dashboard statistics (currently shows 0s)
- [ ] Add error boundaries for better error handling
- [ ] Implement loading skeletons for better UX

## 🎨 Demo Features

All implemented features are fully functional for demo purposes:

- ✅ No authentication required
- ✅ Mock payment processing
- ✅ Automatic balance calculations
- ✅ Real-time data updates via React Query
- ✅ Toast notifications for user feedback
- ✅ Responsive UI with Tailwind CSS

## 📞 Support

If you encounter any issues during the migration, please check:

1. Node.js version (must be v18+)
2. Package installation completed successfully
3. Firebase configuration is correct
4. Firestore database is accessible

---

**Note**: This is a demo application. For production use, implement proper:

- Authentication and authorization
- Data validation and sanitization
- Rate limiting
- Backup and recovery
- Monitoring and logging
