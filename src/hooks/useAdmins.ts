import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  resetAdminPassword,
} from '@/services/admins.service'
import type { AdminFormData } from '@/types/admin.types'

export function useAdmins() {
  return useQuery({
    queryKey: ['admins'],
    queryFn: getAdmins,
  })
}

export function useCreateAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminFormData) => createAdmin(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  })
}

export function useUpdateAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminFormData }) => updateAdmin(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  })
}

export function useUpdateAdminStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      updateAdminStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  })
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      resetAdminPassword(id, newPassword),
  })
}
