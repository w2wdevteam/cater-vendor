import { useEffect, useState } from 'react'
import { Pencil, ToggleLeft, ToggleRight, Plus, Shield, ShieldCheck, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  useAdmins,
  useCreateAdmin,
  useUpdateAdmin,
  useUpdateAdminStatus,
  useResetAdminPassword,
} from '@/hooks/useAdmins'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Admin, AdminFormData, AdminRole } from '@/types/admin.types'
import AdminSheet from './AdminSheet'
import ResetPasswordDialog from './ResetPasswordDialog'

const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
}

const roleStyles: Record<AdminRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
}

export default function AdminsPage() {
  const { data, isLoading } = useAdmins()
  const createMut = useCreateAdmin()
  const updateMut = useUpdateAdmin()
  const statusMut = useUpdateAdminStatus()
  const resetPwMut = useResetAdminPassword()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Admin | null>(null)
  const [resetPwTarget, setResetPwTarget] = useState<Admin | null>(null)

  useEffect(() => {
    document.title = 'Admins — Catering Admin'
  }, [])

  function handleCreate() {
    setEditAdmin(null)
    setSheetOpen(true)
  }

  function handleEdit(admin: Admin) {
    setEditAdmin(admin)
    setSheetOpen(true)
  }

  function handleSubmit(values: AdminFormData) {
    if (editAdmin) {
      updateMut.mutate(
        { id: editAdmin.id, data: values },
        {
          onSuccess: () => {
            toast.success('Admin updated')
            setSheetOpen(false)
          },
        },
      )
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          toast.success('Admin created')
          setSheetOpen(false)
        },
      })
    }
  }

  function confirmToggle() {
    if (!toggleTarget) return
    const newStatus = toggleTarget.status === 'active' ? 'inactive' : 'active'
    statusMut.mutate(
      { id: toggleTarget.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            newStatus === 'active'
              ? `${toggleTarget.name} reactivated`
              : `${toggleTarget.name} deactivated`,
          )
          setToggleTarget(null)
        },
      },
    )
  }

  return (
    <>
      <PageHeader
        title="Admins"
        subtitle="Manage admin users who can access this platform."
        action={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        }
      />

      {isLoading ? (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ) : data && data.length > 0 ? (
        <div className="rounded-lg border bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Login</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((admin) => (
                <tr key={admin.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{admin.name}</span>
                      <div className="text-xs text-gray-500">{admin.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        roleStyles[admin.role],
                      )}
                    >
                      {admin.role === 'super_admin' ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <Shield className="h-3 w-3" />
                      )}
                      {roleLabels[admin.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={admin.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : 'Never'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setResetPwTarget(admin)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Change Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setToggleTarget(admin)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title={admin.status === 'active' ? 'Deactivate' : 'Reactivate'}
                      >
                        {admin.status === 'active' ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border bg-white py-8 shadow-sm">
          <EmptyState
            icon={<Shield className="h-12 w-12" />}
            title="No admins yet"
            description="No admin users have been added yet."
            action={
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4" />
                Add Admin
              </Button>
            }
          />
        </div>
      )}

      <AdminSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        admin={editAdmin}
        onSubmit={handleSubmit}
        loading={createMut.isPending || updateMut.isPending}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => { if (!open) setToggleTarget(null) }}
        title={
          toggleTarget?.status === 'active'
            ? 'Deactivate Admin'
            : 'Reactivate Admin'
        }
        description={
          toggleTarget?.status === 'active'
            ? `This admin will no longer be able to log in. Are you sure you want to deactivate ${toggleTarget?.name}?`
            : `This admin will be able to log in again. Are you sure you want to reactivate ${toggleTarget?.name}?`
        }
        confirmLabel={toggleTarget?.status === 'active' ? 'Deactivate' : 'Reactivate'}
        destructive={toggleTarget?.status === 'active'}
        loading={statusMut.isPending}
        onConfirm={confirmToggle}
      />

      <ResetPasswordDialog
        open={!!resetPwTarget}
        onOpenChange={(open) => { if (!open) setResetPwTarget(null) }}
        adminName={resetPwTarget?.name ?? ''}
        loading={resetPwMut.isPending}
        onConfirm={(newPassword) => {
          if (resetPwTarget) {
            resetPwMut.mutate(
              { id: resetPwTarget.id, newPassword },
              {
                onSuccess: () => {
                  toast.success(`Password updated for ${resetPwTarget.name}`)
                  setResetPwTarget(null)
                },
              },
            )
          }
        }}
      />
    </>
  )
}
