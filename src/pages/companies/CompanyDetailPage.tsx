import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Layers,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  User,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { useCompany, useCompanyDepartments } from '@/hooks/useCompanies'
import { useLocations, useCreateLocation, useUpdateLocation } from '@/hooks/useLocations'
import type { DeliveryLocation, LocationFormData } from '@/types/location.types'
import LocationSheet from '@/pages/locations/LocationSheet'

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: company, isLoading } = useCompany(id)
  const { data: departments, isLoading: deptsLoading } =
    useCompanyDepartments(id)
  const { data: locations, isLoading: locsLoading } = useLocations(id)
  const createLocMut = useCreateLocation()
  const updateLocMut = useUpdateLocation()
  const [locSheetOpen, setLocSheetOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<DeliveryLocation | null>(null)

  function handleCreateLocation(values: LocationFormData) {
    createLocMut.mutate(values, {
      onSuccess: () => {
        toast.success('Location created')
        setLocSheetOpen(false)
      },
      onError: () => toast.error('Failed to create location'),
    })
  }

  function handleUpdateLocation(values: LocationFormData) {
    if (!editingLocation) return
    updateLocMut.mutate(
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

  useEffect(() => {
    document.title = company
      ? `${company.name} — Catering Admin`
      : 'Company Detail — Catering Admin'
  }, [company])

  if (isLoading || !company) {
    return (
      <>
        <PageHeader title="Company Detail" />
        <div className="max-w-4xl space-y-6">
          <div className="h-48 animate-pulse rounded-lg border bg-gray-100" />
          <div className="h-32 animate-pulse rounded-lg border bg-gray-100" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={company.name}
        subtitle="Company details and departments."
        action={
          <Button variant="outline" onClick={() => navigate('/companies')}>
            <ArrowLeft className="h-4 w-4" />
            Back to companies
          </Button>
        }
      />

      <div className="max-w-4xl space-y-6">
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Company Information
            </h2>
            <StatusBadge status={company.status} />
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Company Name
                </p>
                <p className="text-sm text-gray-900">{company.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Delivery Location
                </p>
                <p className="text-sm text-gray-900">
                  {company.deliveryLocation}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Contact Person
                </p>
                <p className="text-sm text-gray-900">{company.contactName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{company.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{company.contactPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">Employees</p>
                <p className="text-sm text-gray-900">
                  {company.employeeCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {company.adminName && (
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Company Admin
              </h2>
            </div>
            <div className="flex items-center gap-3 p-6">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {company.adminName}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {company.adminEmail}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Departments
            </h2>
            <span className="text-xs text-gray-500">
              {departments?.length ?? 0} department
              {departments?.length !== 1 ? 's' : ''}
            </span>
          </div>
          {deptsLoading ? (
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : departments && departments.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Delivery Location</th>
                  <th className="px-6 py-3">Contact Person</th>
                  <th className="px-6 py-3">Building / Floor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Layers className="h-3.5 w-3.5 text-gray-400" />
                        {dept.name}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {dept.deliveryLocation}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {dept.contactPerson}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {dept.buildingFloor ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No departments found for this company.
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Locations
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {locations?.length ?? 0} location
                {locations?.length !== 1 ? 's' : ''}
              </span>
              {!company.selfManaged && (
                <Button size="sm" variant="outline" onClick={() => setLocSheetOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Location
                </Button>
              )}
            </div>
          </div>
          {locsLoading ? (
            <div className="divide-y">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : locations && locations.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Status</th>
                  {!company.selfManaged && <th className="px-6 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y">
                {locations.map((loc) => (
                  <tr key={loc.id}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {loc.name}
                      </div>
                      {loc.notes && (
                        <p className="ml-5.5 text-xs text-gray-500">{loc.notes}</p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {loc.address}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {loc.contactPerson ?? '—'}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={loc.status} />
                    </td>
                    {!company.selfManaged && (
                      <td className="px-6 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingLocation(loc)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No locations found for this company.
            </div>
          )}
        </div>
      </div>

      {!company.selfManaged && (
        <>
          <LocationSheet
            open={locSheetOpen}
            onOpenChange={setLocSheetOpen}
            companies={[company]}
            fixedCompanyId={company.id}
            onSubmit={handleCreateLocation}
            loading={createLocMut.isPending}
          />
          <LocationSheet
            open={!!editingLocation}
            onOpenChange={(v) => { if (!v) setEditingLocation(null) }}
            companies={[company]}
            fixedCompanyId={company.id}
            location={editingLocation}
            onSubmit={handleUpdateLocation}
            loading={updateLocMut.isPending}
          />
        </>
      )}
    </>
  )
}
