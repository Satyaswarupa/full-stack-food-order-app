import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import connectDB from './mongodb'
import User, { IUser } from './models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) return null
    
    const payload = verifyToken(token)
    if (!payload) return null
    
    await connectDB()
    const user = await User.findById(payload.userId).select('-password')
    
    return user
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<IUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin(): Promise<IUser> {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return user
}
