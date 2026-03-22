import { Context } from 'hono'
import { ZodError } from 'zod'

export const errorHandler = async (err: Error, c: Context) => {
  console.error('Error:', err)

  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }, 400)
  }

  if (err.message === 'Unauthorized') {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  if (err.message === 'Forbidden') {
    return c.json({ success: false, error: 'Forbidden' }, 403)
  }

  if (err.message === 'Not found') {
    return c.json({ success: false, error: 'Not found' }, 404)
  }

  return c.json({
    success: false,
    error: err.message || 'Internal server error',
  }, 500)
}
