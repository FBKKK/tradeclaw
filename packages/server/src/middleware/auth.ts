import { Context, Next } from 'hono'
import { jwt } from 'hono/jwt'
import type { AuthUser } from '@tradeclaw/core'

export interface JWTPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

export const authMiddleware = async (c: Context, next: Next) => {
  const jwtMiddleware = jwt({
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    cookie: 'token',
  })

  try {
    await jwtMiddleware(c, async () => {
      const payload = c.get('jwtPayload') as JWTPayload
      const user: AuthUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      }
      c.set('user', user)
      await next()
    })
  } catch {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
}

export const getAuthUser = (c: Context): AuthUser | null => {
  return c.get('user') || null
}
