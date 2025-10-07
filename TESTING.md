# 🧪 Testing Guide - Forgot Password & Email Verification

## ✅ Fix Applied

**Error Fixed:** `useSession must be wrapped in a <SessionProvider />`

**Solution:** Created `<Providers>` component that wraps the dashboard layout with `SessionProvider` from NextAuth.

---

## 🚀 Quick Test Checklist

### 1. Test Sign Up with Email Verification

```bash
1. Navigate to: http://localhost:3000/auth/signup
2. Fill in the form:
   - Username: testuser
   - Email: your-email@gmail.com
   - Password: password123
3. Click "Create account"
4. ✅ Should see: "Account created! Please check your email to verify your account."
5. Check your email inbox (tabiomailer@gmail.com will send it)
6. Click the verification link in the email
7. ✅ Should see: "Email Verified!" page
8. ✅ Should receive welcome email
9. Redirected to sign-in page
```

### 2. Test Forgot Password Flow

```bash
1. Navigate to: http://localhost:3000/auth/signin
2. Click "Forgot password?" link (below password field)
3. Enter your email address
4. Click "Send Reset Link"
5. ✅ Should see success message and instructions
6. Check your email for password reset link
7. Click the reset link in the email
8. Enter new password (twice for confirmation)
9. Click "Reset Password"
10. ✅ Should see success message
11. Redirected to sign-in page
12. Sign in with new password
```

### 3. Test Sign In

```bash
1. Navigate to: http://localhost:3000/auth/signin
2. Enter email and password
3. Click "Sign In"
4. ✅ Should redirect to dashboard
5. ✅ Header should show user avatar and name
6. ✅ Sidebar should be visible
```

### 4. Test Dashboard Access

```bash
1. After signing in, you should be at: http://localhost:3000/dashboard
2. ✅ Header shows: "Welcome back, [username]!"
3. ✅ User avatar dropdown works
4. ✅ Can access all dashboard pages
5. Click "Sign Out" in dropdown
6. ✅ Redirects to homepage
```

---

## 🔍 What to Look For

### Email Templates
When you receive emails, they should have:
- ✨ **Gradient headers** (purple for verification, pink for reset)
- 📱 **Responsive design** (looks good on mobile)
- 🎨 **Professional styling** with buttons
- 🔗 **Working links** that open in browser

### Security Features
- ✅ Tokens expire (verification: 24h, reset: 1h)
- ✅ Tokens are one-time use (deleted after use)
- ✅ Email enumeration prevention (always shows success)
- ✅ Password validation (minimum 6 characters)

### User Experience
- ✅ Toast notifications for all actions
- ✅ Loading states on buttons
- ✅ Clear error messages
- ✅ Auto-redirect after success
- ✅ Helpful instructions

---

## 📧 Email Credentials

**Sending From:** tabiomailer@gmail.com  
**SMTP:** smtp.gmail.com:587  
**App Password:** gseszeanupnwoaic

All emails will be sent from this account. Check your spam folder if you don't see them.

---

## 🐛 Troubleshooting

### Email Not Received?
```bash
1. Check spam/junk folder
2. Wait a few minutes (SMTP can be slow)
3. Check terminal for errors
4. Verify .env has correct SMTP settings
```

### Token Invalid/Expired?
```bash
1. Verification tokens expire in 24 hours
2. Reset tokens expire in 1 hour
3. Request a new token if expired
4. Check database to see if token exists:
   - Run: npx prisma studio
   - Check VerificationToken or PasswordResetToken tables
```

### SessionProvider Error Still Showing?
```bash
1. Clear browser cache and reload
2. Stop dev server (Ctrl+C)
3. Run: npm run dev
4. Hard refresh browser (Ctrl+Shift+R)
```

### Database Issues?
```bash
# Check database is in sync
npx prisma db push

# Regenerate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

---

## 🎯 Key Files

### Server Actions
- `/src/app/actions/auth.ts` - Registration & email verification
- `/src/app/actions/password-reset.ts` - Password reset logic

### Email Service
- `/src/lib/email.ts` - All email templates and sending logic

### Pages
- `/src/app/auth/signup/page.tsx` - Registration
- `/src/app/auth/signin/page.tsx` - Sign in (with forgot password link)
- `/src/app/auth/forgot-password/page.tsx` - Request password reset
- `/src/app/auth/reset-password/page.tsx` - Reset password with token
- `/src/app/auth/verify-email/page.tsx` - Verify email with token

### Components
- `/src/components/providers.tsx` - **NEW!** SessionProvider wrapper
- `/src/components/header.tsx` - Dashboard header with user menu

### Configuration
- `/.env` - Environment variables (SMTP, database, etc.)
- `/prisma/schema.prisma` - Database schema with PasswordResetToken

---

## 📊 Database Schema

### New Model Added
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Check Database
```bash
# Open Prisma Studio
npx prisma studio

# Navigate to:
# - User (see all users)
# - VerificationToken (see verification tokens)
# - PasswordResetToken (see reset tokens)
```

---

## ✨ Features Implemented

### ✅ Complete Authentication System
- [x] User registration with email verification
- [x] Email verification flow (24h expiry)
- [x] Forgot password functionality
- [x] Password reset with secure tokens (1h expiry)
- [x] Welcome email after verification
- [x] Professional HTML email templates
- [x] Toast notifications throughout
- [x] Error handling and validation
- [x] Session management with NextAuth
- [x] Protected dashboard routes

### ✅ Security
- [x] SHA-256 hashed tokens
- [x] One-time use tokens
- [x] bcrypt password hashing (12 rounds)
- [x] Email enumeration prevention
- [x] Token expiration
- [x] Secure token generation (crypto.randomBytes)

### ✅ User Experience
- [x] Responsive design
- [x] Loading states
- [x] Success/error messages
- [x] Auto-redirects
- [x] Clear instructions
- [x] Helpful error messages
- [x] Mobile-friendly emails

---

## 🚀 Next Steps

1. **Test Everything** - Go through all the test scenarios above
2. **Check Emails** - Verify email templates look good
3. **Test Edge Cases** - Try invalid tokens, expired tokens, etc.
4. **Create Test Users** - Sign up a few test accounts
5. **Test Password Reset** - Change passwords and verify it works

---

## 📝 Notes

- All emails are sent via Gmail SMTP (tabiomailer@gmail.com)
- Tokens are stored hashed in the database for security
- Verification tokens valid for 24 hours
- Password reset tokens valid for 1 hour
- SessionProvider now wraps the dashboard layout
- Toaster is in root layout for global toast notifications

---

**Status:** ✅ Ready to Test  
**Last Updated:** January 2025  
**Version:** 1.0.0
