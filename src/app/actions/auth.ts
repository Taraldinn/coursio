"use server"

import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email"
import { z } from "zod"
import crypto from "crypto"

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function registerUser(formData: FormData) {
  try {
    const data = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validated = registerSchema.parse(data)

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.email },
          { username: validated.username },
        ],
      },
    })

    if (existingUser) {
      return {
        error: existingUser.email === validated.email
          ? "Email already registered"
          : "Username already taken",
      }
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        username: validated.username,
        email: validated.email,
        password: hashedPassword,
      },
    })

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires,
      },
    })

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`
    await sendVerificationEmail(user.email, user.username, verificationUrl)

    return {
      success: true,
      userId: user.id,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: "Failed to create account" }
  }
}

export async function verifyEmail(token: string) {
  try {
    const verification = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verification) {
      return { error: "Invalid verification token" }
    }

    if (verification.expires < new Date()) {
      return { error: "Verification token expired" }
    }

    const user = await prisma.user.update({
      where: { email: verification.identifier },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username)

    return { success: true }
  } catch (error) {
    return { error: "Verification failed" }
  }
}
