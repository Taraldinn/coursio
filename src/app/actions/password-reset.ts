"use server"

import prisma from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { z } from "zod"
import crypto from "crypto"

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function requestPasswordReset(email: string) {
  try {
    const validated = emailSchema.parse({ email })

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return { 
        success: true, 
        message: "If an account exists, a password reset link has been sent to your email." 
      }
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    })

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
    await sendPasswordResetEmail(user.email, user.username, resetUrl)

    return { 
      success: true, 
      message: "If an account exists, a password reset link has been sent to your email." 
    }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { error: "Failed to process password reset request" }
  }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Invalid token"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function resetPassword(token: string, password: string) {
  try {
    const validated = resetPasswordSchema.parse({ token, password })

    // Hash the token to compare with database
    const hashedToken = crypto.createHash("sha256").update(validated.token).digest("hex")

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!resetToken) {
      return { error: "Invalid or expired reset token" }
    }

    // Hash new password
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    })

    // Delete used reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return { success: true, message: "Password has been reset successfully" }
  } catch (error) {
    console.error("Password reset error:", error)
    return { error: "Failed to reset password" }
  }
}

export async function verifyResetToken(token: string) {
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: { gt: new Date() },
      },
    })

    return { valid: !!resetToken }
  } catch (error) {
    return { valid: false }
  }
}
