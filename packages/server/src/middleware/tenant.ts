import { Context, Next } from 'hono'

export interface TenantContext {
  userId: string
  tenantId: string
}

export const tenantMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  // In a multi-tenant system, tenantId would be derived from user.tenantId
  // For now, we use user.id as the tenant (each user is their own tenant)
  const tenant: TenantContext = {
    userId: user.id,
    tenantId: user.id,
  }

  c.set('tenant', tenant)
  await next()
}

export const getTenant = (c: Context): TenantContext => {
  return c.get('tenant')
}
