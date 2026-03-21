import { z } from 'zod'

export const UserRole = z.enum(['user', 'admin'])
export type UserRole = z.infer<typeof UserRole>

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: UserRole.default('user'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
})

export type User = z.infer<typeof UserSchema>

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type UserCreate = z.infer<typeof UserCreateSchema>

export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  role: UserRole.optional(),
})

export type UserUpdate = z.infer<typeof UserUpdateSchema>

export interface UserPublic {
  id: string
  email: string
  role: UserRole
  createdAt: Date
}
