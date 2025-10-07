# Password Reset & Email Verification Guide

## Overview

Coursio now includes comprehensive email verification and password reset functionality using Gmail SMTP. This guide covers all the features and how they work.

## Features Implemented

### 1. **Email Verification** ✅
- New users receive a verification email upon signup
- Email contains a secure verification link (valid for 24 hours)
- Users must verify their email before full access
- Welcome email sent after successful verification

### 2. **Forgot Password** ✅
- Users can request password reset from sign-in page
- Secure reset tokens generated with 1-hour expiration
- Reset link sent via email
- Password can be reset with new secure password

### 3. **Email Templates** ✅
Professional HTML email templates for:
- **Verification Email** - Purple gradient design with call-to-action
- **Password Reset Email** - Pink/red gradient with security notice
- **Welcome Email** - Celebration email after verification

## User Flow

### Sign Up Flow
1. User creates account at `/auth/signup`
2. Account created with unverified email status
3. Verification email sent automatically
4. User clicks link in email
5. Email verified at `/auth/verify-email?token=xxx`
6. Welcome email sent
7. User can now sign in

### Forgot Password Flow
1. User clicks "Forgot password?" on sign-in page
2. Navigate to `/auth/forgot-password`
3. Enter email address
4. Password reset email sent (if account exists)
5. User clicks reset link in email
6. Navigate to `/auth/reset-password?token=xxx`
7. Enter new password
8. Password updated
9. Redirect to sign-in

## Technical Implementation

### Database Schema

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
}
```

### Server Actions

**`/src/app/actions/password-reset.ts`**
- `requestPasswordReset(email)` - Generate and send reset token
- `resetPassword(token, password)` - Validate token and update password
- `verifyResetToken(token)` - Check if token is valid

**`/src/app/actions/auth.ts`**
- Updated `registerUser()` - Send verification email
- Updated `verifyEmail()` - Send welcome email

### Email Service

**`/src/lib/email.ts`**
- `sendVerificationEmail()` - HTML template for email verification
- `sendPasswordResetEmail()` - HTML template for password reset
- `sendWelcomeEmail()` - HTML template for welcome message

Uses **nodemailer** with Gmail SMTP:
```typescript
host: "smtp.gmail.com"
port: 587
auth: {
  user: "tabiomailer@gmail.com"
  pass: "gseszeanupnwoaic" // App password
}
```

### Routes

| Route | Purpose |
|-------|---------|
| `/auth/signup` | User registration |
| `/auth/signin` | User sign-in (with forgot password link) |
| `/auth/verify-email` | Email verification handler |
| `/auth/forgot-password` | Request password reset |
| `/auth/reset-password` | Reset password with token |

## Environment Variables

Required in `.env`:

```env
# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Configuration (Gmail SMTP)
EMAIL_FROM="tabiomailer@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tabiomailer@gmail.com"
SMTP_PASSWORD="gseszeanupnwoaic"
```

## Security Features

### Token Security
- **Verification tokens**: 32-byte random hex (SHA-256 hashed)
- **Reset tokens**: 32-byte random hex (SHA-256 hashed)
- Tokens stored as hashed values in database
- One-time use tokens (deleted after use)

### Expiration
- Verification tokens: 24 hours
- Password reset tokens: 1 hour

### Password Requirements
- Minimum 6 characters (configurable)
- Hashed with bcryptjs (12 rounds)

### Security Best Practices
- ✅ Email enumeration prevention (always returns success message)
- ✅ Token validation before password reset
- ✅ Automatic token cleanup after use
- ✅ One reset token per user (old tokens deleted)
- ✅ Secure token generation with crypto.randomBytes
- ✅ HTTPS required in production

## Email Template Features

### Professional Design
- Responsive HTML emails
- Gradient headers (matches brand colors)
- Clear call-to-action buttons
- Mobile-friendly layout
- Dark mode support

### Accessibility
- Fallback text links for all buttons
- High contrast text
- Clear typography
- Semantic HTML structure

## Testing

### Test Email Verification
1. Create new account
2. Check Gmail inbox for verification email
3. Click verification link
4. Confirm welcome email received
5. Sign in with new account

### Test Password Reset
1. Go to sign-in page
2. Click "Forgot password?"
3. Enter registered email
4. Check Gmail inbox for reset email
5. Click reset link
6. Enter new password
7. Confirm password updated
8. Sign in with new password

## Error Handling

### User-Friendly Messages
- Invalid tokens: "Invalid or expired reset token"
- Expired tokens: Automatic detection and clear message
- Missing tokens: Redirect to appropriate page
- Network errors: Generic "Something went wrong" message

### Edge Cases Handled
- ✅ Multiple reset requests (old tokens deleted)
- ✅ Expired tokens (validated before use)
- ✅ Invalid email addresses (validated with Zod)
- ✅ Non-existent accounts (generic success message)
- ✅ Already verified emails (no duplicate verification)

## Production Deployment

### Gmail SMTP Configuration
For production, consider:
1. **Gmail App Password** - Already configured
2. **Email Service** - Consider upgrading to:
   - SendGrid (better deliverability)
   - Postmark (transactional emails)
   - AWS SES (cost-effective)

### Environment Setup
1. Set `NEXT_PUBLIC_APP_URL` to production domain
2. Ensure SMTP credentials are secured
3. Enable HTTPS (required for secure tokens)
4. Configure proper email SPF/DKIM records

### Database Migration
Already applied:
```bash
npx prisma db push
```

## UI Components

### Sign In Page
- Added "Forgot password?" link above password field
- Link styled with hover effect
- Positioned in top-right of password field

### Forgot Password Page
- Clean card layout
- Email input with validation
- Success state with instructions
- "Send Another Link" option
- "Back to Sign In" link

### Reset Password Page
- Token validation on load
- Password strength requirements
- Confirm password field
- Success state with auto-redirect
- Invalid token error handling

### Verify Email Page
- Loading state during verification
- Success state with celebration
- Error state with alternatives
- Auto-redirect after success

## Monitoring & Logs

### Server-Side Logging
All email operations logged to console:
- Email send attempts
- Token generation
- Verification attempts
- Password reset attempts

### Error Tracking
Errors caught and logged for:
- Email delivery failures
- Database operations
- Token validation
- Password hashing

## Future Enhancements

Potential improvements:
1. **Email Templates** - Add more customization options
2. **Rate Limiting** - Prevent abuse of reset requests
3. **2FA** - Add two-factor authentication
4. **Email Preferences** - User email notification settings
5. **Account Recovery** - Additional recovery methods
6. **Email Queue** - Background job processing for emails
7. **Analytics** - Track email open rates and link clicks

## Troubleshooting

### Emails Not Sending
1. Check SMTP credentials in `.env`
2. Verify Gmail app password is correct
3. Check server logs for error messages
4. Ensure `NEXT_PUBLIC_APP_URL` is set
5. Verify port 587 is not blocked

### Tokens Not Working
1. Check token expiration times
2. Verify database connection
3. Ensure tokens are being created
4. Check URL parameter formatting

### Common Issues
- **Email in spam**: Configure SPF/DKIM records
- **Token expired**: Reduce user wait time
- **Password not updating**: Check bcrypt hashing
- **Links not working**: Verify NEXT_PUBLIC_APP_URL

## Support

For issues or questions:
1. Check error logs in terminal
2. Verify environment variables
3. Test email configuration
4. Review database schema
5. Check Prisma migrations

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
