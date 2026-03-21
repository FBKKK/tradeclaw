import { Hono } from 'hono'
import { hash, compare } from '@node-rs/bcrypt'
import jwt from 'jsonwebtoken'
const { sign, verify } = jwt
import { v4 as uuid } from 'uuid'
import { UserCreateSchema } from '@tradeclaw/core'

export const authRoutes = new Hono()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

// In-memory store (replace with DB)
const users = new Map<string, { id: string; email: string; passwordHash: string; role: string }>()

authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    const validated = UserCreateSchema.parse(body)

    // Check if user exists
    const existingUser = Array.from(users.values()).find((u) => u.email === validated.email)
    if (existingUser) {
      return c.json({ success: false, error: 'Email already registered' }, 400)
    }

    const passwordHash = await hash(validated.password, 10)
    const user = {
      id: uuid(),
      email: validated.email,
      passwordHash,
      role: 'user',
    }

    users.set(user.id, user)

    const accessToken = sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )

    const refreshToken = sign(
      { sub: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    )

    return c.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    return c.json({ success: false, error: 'Registration failed' }, 400)
  }
})

authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = body

    const user = Array.from(users.values()).find((u) => u.email === email)
    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401)
    }

    const valid = await compare(password, user.passwordHash)
    if (!valid) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401)
    }

    const accessToken = sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )

    const refreshToken = sign(
      { sub: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    )

    return c.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return c.json({ success: false, error: 'Login failed' }, 500)
  }
})

authRoutes.post('/refresh', async (c) => {
  try {
    const body = await c.req.json()
    const { refreshToken } = body

    const payload = verify(refreshToken, JWT_SECRET) as { sub: string; type: string }
    if (payload.type !== 'refresh') {
      return c.json({ success: false, error: 'Invalid token type' }, 401)
    }

    const user = users.get(payload.sub)
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 401)
    }

    const accessToken = sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )

    return c.json({
      success: true,
      data: {
        accessToken,
        expiresIn: 900,
      },
    })
  } catch {
    return c.json({ success: false, error: 'Invalid refresh token' }, 401)
  }
})
