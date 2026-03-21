import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
const { verify } = jwt
import type { AuthUser } from '@tradeclaw/core'

export interface JWTPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)

  try {
    const payload = verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as JWTPayload
    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
    c.set('user', user)
    await next()
  } catch (err) {
    console.error('JWT verify error:', err)
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
}

export const getAuthUser = (c: Context): AuthUser | null => {
  return c.get('user') || null
}
