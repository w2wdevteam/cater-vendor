import { adminsApi, type ApiAdmin } from '@/api/endpoints/admins.api'
import type { Admin, AdminFormData } from '@/types/admin.types'

function mapAdmin(a: ApiAdmin): Admin {
  return {
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    email: a.email,
    status: a.status,
    lastLogin: a.lastLogin,
    createdAt: a.createdAt,
  }
}

export async function getAdmins(): Promise<Admin[]> {
  const result = await adminsApi.list({ limit: 100 })
  return result.data.map(mapAdmin).sort((a, b) => a.fullName.localeCompare(b.fullName))
}

export async function createAdmin(data: AdminFormData): Promise<Admin> {
  if (!data.password) {
    throw new Error('Password is required when creating an admin')
  }
  const created = await adminsApi.create({
    fullName: data.fullName,
    phone: data.phone,
    email: data.email || undefined,
    password: data.password,
  })
  return mapAdmin(created)
}

export async function updateAdmin(id: string, data: AdminFormData): Promise<Admin> {
  return mapAdmin(
    await adminsApi.update(id, {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
    }),
  )
}

export async function updateAdminStatus(
  id: string,
  status: 'active' | 'inactive',
): Promise<void> {
  await adminsApi.setStatus(id, status)
}

export async function resetAdminPassword(id: string, newPassword: string): Promise<void> {
  await adminsApi.resetPassword(id, newPassword)
}
