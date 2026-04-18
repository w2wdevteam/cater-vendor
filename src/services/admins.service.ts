import type { Admin, AdminFormData } from '@/types/admin.types'

let adminsState: Admin[] = [
  {
    id: 'admin-1',
    name: 'Catering Manager',
    email: 'manager@freshbites.com',
    role: 'super_admin',
    status: 'active',
    createdAt: '2025-01-10T09:00:00Z',
    lastLoginAt: '2026-04-18T08:30:00Z',
  },
  {
    id: 'admin-2',
    name: 'Lisa Wang',
    email: 'lisa@freshbites.com',
    role: 'admin',
    status: 'active',
    createdAt: '2025-05-01T10:00:00Z',
    lastLoginAt: '2026-04-17T14:20:00Z',
  },
  {
    id: 'admin-3',
    name: 'Tom Harris',
    email: 'tom@freshbites.com',
    role: 'admin',
    status: 'inactive',
    createdAt: '2025-03-15T11:00:00Z',
    lastLoginAt: '2026-02-10T09:15:00Z',
  },
]

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getAdmins(): Promise<Admin[]> {
  await delay()
  return [...adminsState].sort((a, b) => a.name.localeCompare(b.name))
}

export async function createAdmin(data: AdminFormData): Promise<Admin> {
  await delay(500)
  const admin: Admin = {
    id: `admin-${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  }
  adminsState = [...adminsState, admin]
  return admin
}

export async function updateAdmin(id: string, data: AdminFormData): Promise<Admin> {
  await delay(400)
  adminsState = adminsState.map((a) =>
    a.id === id ? { ...a, name: data.name, email: data.email, role: data.role } : a,
  )
  const admin = adminsState.find((a) => a.id === id)
  if (!admin) throw new Error('Admin not found')
  return { ...admin }
}

export async function updateAdminStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
  await delay(400)
  adminsState = adminsState.map((a) => (a.id === id ? { ...a, status } : a))
}

export async function resetAdminPassword(_id: string, _newPassword: string): Promise<void> {
  await delay(400)
}
