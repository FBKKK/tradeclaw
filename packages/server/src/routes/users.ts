import { Hono } from 'hono'
import { authMiddleware, getAuthUser } from '../middleware/auth.js'
import { UserUpdateSchema } from '@tradeclaw/core'

export const userRoutes = new Hono()

// Apply auth middleware to all routes
userRoutes.use('/*', authMiddleware)

// Get current user
userRoutes.get('/me', (c) => {
  const user = getAuthUser(c)
  if (!user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  return c.json({
    success: true,
    data: user,
  })
})

// Update current user
userRoutes.patch('/me', async (c) => {
  const user = getAuthUser(c)
  if (!user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  try {
    const body = await c.req.json()
    const validated = UserUpdateSchema.parse(body)

    return c.json({
      success: true,
      data: {
        ...user,
        ...validated,
      },
    })
  } catch (err) {
    return c.json({ success: false, error: 'Update failed' }, 400)
  }
})
