import { useEffect, useMemo, useState } from 'react'
import { MapPin, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocations, useCreateLocation, useUpdateLocation } from '@/hooks/useLocations'
import { useCompanies } from '@/hooks/useCompanies'
import type { DeliveryLocation, LocationFormData } from '@/types/location.types'
import LocationSheet from './LocationSheet'

export default function LocationsPage() {
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const { data: locations, isLoading } = useLocations(companyFilter)
  const { data: companies } = useCompanies()
  const createMut = useCreateLocation()
  const updateMut = useUpdateLocation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<DeliveryLocation | null>(null)

  const cateringManagedCompanies = useMemo(
    () => (companies ?? []).filter((c) => !c.selfManaged && c.status === 'active'),
    [companies],
  )

  const selfManagedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const c of companies ?? []) {
      if (c.selfManaged) ids.add(c.id)
    }
    return ids
  }, [companies])

  useEffect(() => {
    document.title = 'Locations — Catering Admin'
  }, [])

  function handleCreate(values: LocationFormData) {
    createMut.mutate(values, {
      onSuccess: () => {
        toast.success('Location created')
        setSheetOpen(false)
      },
      onError: () => toast.error('Failed to create location'),
    })
  }

  function handleUpdate(values: LocationFormData) {
    if (!editingLocation) return
    updateMut.mutate(
      { id: editingLocation.id, data: values },
      {
        onSuccess: () => {
          toast.success('Location updated')
          setEditingLocation(null)
        },
        onError: () => toast.error('Failed to update location'),
      },
    )
  }

  function openEdit(loc: DeliveryLocation) {
    setEditingLocation(loc)
  }

  return (
    <>
      <PageHeader
        title="Delivery Locations"
        subtitle="View and manage delivery locations for client companies."
        action={
          cateringManagedCompanies.length > 0 ? (
            <Button onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {companies?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-56 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ) : locations && locations.length > 0 ? (
        <div className="rounded-lg border bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {locations.map((loc) => {
                const isSelfManaged = selfManagedIds.has(loc.companyId)
                return (
                  <tr key={loc.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{loc.name}</span>
                          {loc.notes && (
                            <p className="text-xs text-gray-500">{loc.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          isSelfManaged
                            ? 'text-sm text-gray-700'
                            : 'text-sm font-medium text-amber-700'
                        }
                        title={isSelfManaged ? 'Self-managed' : 'Catering-managed'}
                      >
                        {loc.companyName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{loc.address}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{loc.contactPerson ?? '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={loc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isSelfManaged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(loc)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
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
            icon={<MapPin className="h-12 w-12" />}
            title="No locations yet"
            description={
              companyFilter !== 'all'
                ? 'No delivery locations for this company.'
                : 'No delivery locations have been added yet.'
            }
          />
        </div>
      )}

      <LocationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        companies={cateringManagedCompanies}
        onSubmit={handleCreate}
        loading={createMut.isPending}
      />

      <LocationSheet
        open={!!editingLocation}
        onOpenChange={(v) => { if (!v) setEditingLocation(null) }}
        companies={cateringManagedCompanies}
        location={editingLocation}
        fixedCompanyId={editingLocation?.companyId}
        onSubmit={handleUpdate}
        loading={updateMut.isPending}
      />
    </>
  )
}
