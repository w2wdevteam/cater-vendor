import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useCateringClients,
  useCreateCateringClient,
  useDeleteCateringClient,
  useUpdateCateringClient,
  type CateringClient,
} from '@/hooks/useCateringClients'
import { formatCurrency } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-errors'

interface FormState {
  name: string
  phone: string
  address: string
  locationLink: string
  notes: string
}

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  address: '',
  locationLink: '',
  notes: '',
}

const PHONE_REGEX = /^\+?\d{7,15}$/

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const { data: clients, isLoading } = useCateringClients({
    search: debouncedSearch || undefined,
  })
  const createMutation = useCreateCateringClient()
  const updateMutation = useUpdateCateringClient()
  const deleteMutation = useDeleteCateringClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editClient, setEditClient] = useState<CateringClient | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const [deleteTarget, setDeleteTarget] = useState<CateringClient | null>(null)

  useEffect(() => {
    document.title = 'Clients — Catering Admin'
  }, [])

  function openCreate() {
    setEditClient(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(client: CateringClient) {
    setEditClient(client)
    setForm({
      name: client.name,
      phone: client.phone,
      address: client.address,
      locationLink: client.locationLink ?? '',
      notes: client.notes ?? '',
    })
    setDialogOpen(true)
  }

  const canSubmit =
    form.name.trim() !== '' &&
    PHONE_REGEX.test(form.phone.trim()) &&
    form.address.trim() !== '' &&
    !createMutation.isPending &&
    !updateMutation.isPending

  async function handleSubmit() {
    if (!canSubmit) return
    const body = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      locationLink: form.locationLink.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }
    try {
      if (editClient) {
        await updateMutation.mutateAsync({ id: editClient.id, body })
        toast.success('Client updated')
      } else {
        await createMutation.mutateAsync(body)
        toast.success('Client created')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save client'))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('Client deleted')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete client'))
    }
  }

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Walk-in and event catering clients — separate from corporate companies."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by name, phone, or address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-56 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ) : clients && clients.length > 0 ? (
          <div className="rounded-lg border bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {clients.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="line-clamp-1 max-w-[280px]">{c.address}</span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-medium tabular-nums ${
                        c.balance < 0
                          ? 'text-red-600'
                          : c.balance > 0
                            ? 'text-emerald-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {formatCurrency(c.balance)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<UserRound className="h-12 w-12" />}
            title="No clients yet"
            description={
              search
                ? 'No clients match your search.'
                : 'Add your first walk-in or event client.'
            }
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            }
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
            <DialogDescription>
              External clients (walk-ins, event bookings). Not tied to a company
              contract.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+998..."
                />
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="Street, building, apt"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location link</Label>
              <Input
                value={form.locationLink}
                onChange={(e) =>
                  setForm((f) => ({ ...f, locationLink: e.target.value }))
                }
                placeholder="https://maps.google.com/... (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editClient
                  ? 'Save changes'
                  : 'Create client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Delete <span className="font-medium">{deleteTarget?.name}</span>?
              Clients with existing orders cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
