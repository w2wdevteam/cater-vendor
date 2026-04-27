import { useEffect, useState } from 'react'
import { Pencil, ToggleLeft, ToggleRight, Plus, Shield, KeyRound } from 'lucide-react'
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
import { useAuthStore } from '@/store/auth.store'
import { getApiErrorMessage } from '@/lib/api-errors'
import type { Admin, AdminFormData } from '@/types/admin.types'
import AdminSheet from './AdminSheet'
import ResetPasswordDialog from './ResetPasswordDialog'

export default function AdminsPage() {
  const currentUserId = useAuthStore((s) => s.user?.id)
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
          onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to update admin')),
        },
      )
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          toast.success('Admin created')
          setSheetOpen(false)
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to create admin')),
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
              ? `${toggleTarget.fullName} reactivated`
              : `${toggleTarget.fullName} deactivated`,
          )
          setToggleTarget(null)
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to change status')),
      },
    )
  }

  return (
    <>
      <PageHeader
        title="Admins"
        subtitle="Manage peer admins who can access this catering."
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
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Login</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((admin) => {
                const isSelf = admin.id === currentUserId
                return (
                  <tr key={admin.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {admin.fullName}
                          {isSelf && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                        </span>
                        {admin.email && (
                          <div className="text-xs text-gray-500">{admin.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{admin.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={admin.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {admin.lastLogin ? formatDateTime(admin.lastLogin) : 'Never'}
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
                        {!isSelf && (
                          <button
                            onClick={() => setResetPwTarget(admin)}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Reset Password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                        )}
                        {!isSelf && (
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
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
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
            ? `This admin will no longer be able to log in. Are you sure you want to deactivate ${toggleTarget?.fullName}?`
            : `This admin will be able to log in again. Are you sure you want to reactivate ${toggleTarget?.fullName}?`
        }
        confirmLabel={toggleTarget?.status === 'active' ? 'Deactivate' : 'Reactivate'}
        destructive={toggleTarget?.status === 'active'}
        loading={statusMut.isPending}
        onConfirm={confirmToggle}
      />

      <ResetPasswordDialog
        open={!!resetPwTarget}
        onOpenChange={(open) => { if (!open) setResetPwTarget(null) }}
        adminName={resetPwTarget?.fullName ?? ''}
        loading={resetPwMut.isPending}
        onConfirm={(newPassword) => {
          if (resetPwTarget) {
            resetPwMut.mutate(
              { id: resetPwTarget.id, newPassword },
              {
                onSuccess: () => {
                  toast.success(`Password updated for ${resetPwTarget.fullName}`)
                  setResetPwTarget(null)
                },
                onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to reset password')),
              },
            )
          }
        }}
      />
    </>
  )
}
