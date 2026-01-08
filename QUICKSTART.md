# 🚀 Smart EdFund - Quick Start Guide

## Vấn đề hiện tại

Project đang gặp lỗi với **Node v16.20.2**. Firebase và Vite yêu cầu **Node v18+** để chạy.

## ✅ Giải pháp: Nâng cấp Node.js

### Cách 1: Sử dụng NVM (Khuyến nghị)

```bash
# Cài đặt nvm nếu chưa có
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Cài Node.js v20
nvm install 20
nvm use 20

# Kiểm tra version
node -v  # Should show v20.x.x
```

### Cách 2: Download trực tiếp

1. Truy cập: https://nodejs.org/
2. Download và cài đặt **Node.js 20 LTS**
3. Restart terminal

## 📦 Sau khi nâng cấp Node

```bash
# 1. Xóa node_modules cũ
rm -rf node_modules package-lock.json

# 2. Cài đặt lại dependencies
npm install

# 3. Chạy dev server
npm run dev
```

## 🌱 Seed Demo Data

1. Mở browser: http://localhost:5173
2. Click vào **"Access Admin Portal"**
3. Trong sidebar, click **"Seed Demo Data"**
4. Click nút **"Seed Database Now"**
5. Đợi vài giây để data được tạo

## ✨ Tính năng đã hoàn thành

### 1. Firebase Setup

- ✅ Firebase & Firestore config
- ✅ TypeScript types cho tất cả collections
- ✅ CRUD services với đầy đủ operations
- ✅ React hooks với react-query

### 2. Data Collections

- ✅ **Account Holders** - Quản lý tài khoản học sinh
- ✅ **Courses** - Quản lý khóa học
- ✅ **Enrollments** - Ghi danh học sinh vào khóa học
- ✅ **Course Charges** - Phí khóa học
- ✅ **Transactions** - Lịch sử giao dịch
- ✅ **Top-up Rules** - Quy tắc nạp tiền tự động
- ✅ **Top-up Schedules** - Lịch nạp tiền

### 3. Mock Data (sau khi seed)

- 10 Account Holders (học sinh)
- 7 Courses (các trường đại học, polytechnic)
- 8 Enrollments
- 7 Course Charges (có pending và paid)
- 7 Transactions
- 4 Top-up Rules

## 🎯 Các tính năng chính

### Admin Portal

- **Dashboard**: Tổng quan hệ thống
- **Account Management**: CRUD tài khoản học sinh
  - Tạo mới tài khoản
  - Chỉnh sửa thông tin
  - Xem chi tiết tài khoản
  - Theo dõi balance
- **Top-up Management**:

  - Tạo quy tắc top-up (dựa trên tuổi, balance, trạng thái học)
  - Execute batch top-up (nạp tự động cho nhiều tài khoản)
  - Execute individual top-up (nạp cho 1 tài khoản)
  - Xem lịch sử top-up

- **Course Management**:

  - CRUD khóa học
  - Xem danh sách học sinh đã enroll
  - Quản lý phí khóa học

- **Fee Processing**:
  - Xem tất cả course charges
  - Filter theo status (pending, paid, overdue)
  - Generate charges tự động

### e-Service Portal (Dành cho học sinh)

- **Dashboard**: Thông tin tài khoản cá nhân
- **Account Balance**:
  - Xem số dư
  - Lịch sử transactions
- **Course Fees**:

  - Xem các khoản phí pending
  - Thanh toán bằng education account
  - Thanh toán online (mock)
  - Xem lịch sử thanh toán

- **Profile**: Cập nhật thông tin cá nhân

## 🔑 Điểm quan trọng

### 1. No Authentication

- Không cần đăng nhập
- Admin portal: truy cập trực tiếp
- e-Service portal: random chọn 1 user từ database để demo

### 2. Mock Payment

- Tất cả thanh toán là MOCK
- Click "Pay" sẽ cập nhật status ngay lập tức
- Không có payment gateway thật

### 3. Real-time Updates

- Sử dụng React Query để cache & auto-refresh
- Mọi thay đổi đều được sync ngay lập tức

## 📂 Cấu trúc code quan trọng

```
src/
├── lib/
│   ├── firebase.ts           # Firebase init
│   ├── firestoreServices.ts  # All CRUD operations
│   └── seedData.ts           # Mock data generator
│
├── hooks/                    # React hooks with react-query
│   ├── useAccountHolders.ts
│   ├── useCourses.ts
│   ├── useEnrollments.ts
│   ├── useCourseCharges.ts
│   ├── useTransactions.ts
│   └── useTopUp-firebase.ts
│
├── types/
│   └── firestore.ts          # TypeScript interfaces
│
└── pages/
    ├── admin/                # Admin portal pages
    └── eservice/             # E-service portal pages
```

## 🎨 UI Components

- Sử dụng **shadcn/ui** components
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hook Form** for forms
- **Sonner** for toast notifications

## 🐛 Common Issues

### Error: "Cannot find module 'firebase'"

```bash
npm install firebase
```

### Error: Firestore rules

- Đảm bảo Firestore rules cho phép read/write:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For demo only!
    }
  }
}
```

### Blank page after seeding

- Refresh browser
- Check browser console for errors
- Verify Firebase config in `src/lib/firebase.ts`

## 📞 Next Steps

Sau khi project chạy được, bạn có thể:

1. ✅ Test seed data functionality
2. ✅ Explore Admin Portal features
3. ✅ Test e-Service Portal (click random user)
4. ✅ Try payment flows (both education account & online)
5. ✅ Test batch top-up with rules
6. ✅ Create new accounts, courses, enrollments

## 🎯 Demo Flow Gợi ý

1. **Seed data** (nếu chưa có)
2. **Admin Portal**:
   - Xem dashboard statistics
   - Browse account holders
   - Create a new course
   - Enroll students in course
   - Execute a batch top-up
3. **e-Service Portal**:
   - View account balance
   - Check pending course fees
   - Make a payment
   - View transaction history
   - Update profile information

---

**🎉 Chúc bạn demo thành công!**

Nếu gặp bất kỳ vấn đề gì, hãy:

1. Check Node version: `node -v`
2. Check console for errors
3. Verify Firebase config
4. Clear browser cache
