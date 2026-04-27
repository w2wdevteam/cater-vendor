import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ChevronRight, MapPin, Pencil, Plus, Users } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
} from '@/hooks/useCompanies'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-errors'
import type { Company, CompanyFilters, CompanyFormData } from '@/types/company.types'
import CompanySheet from './CompanySheet'

export default function CompaniesPage() {
  const [filters, setFilters] = useState<CompanyFilters>({
    search: '',
    status: 'all',
  })
  const debouncedSearch = useDebounce(filters.search, 1000)
  const { data: companies, isLoading } = useCompanies({ ...filters, search: debouncedSearch })
  const createMut = useCreateCompany()
  const updateMut = useUpdateCompany()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editCompany, setEditCompany] = useState<Company | null>(null)

  useEffect(() => {
    document.title = 'Companies — Catering Admin'
  }, [])

  function handleCreate() {
    setEditCompany(null)
    setSheetOpen(true)
  }

  function handleEdit(company: Company) {
    setEditCompany(company)
    setSheetOpen(true)
  }

  function handleSubmit(values: CompanyFormData) {
    if (editCompany) {
      updateMut.mutate(
        { id: editCompany.id, data: values },
        {
          onSuccess: () => {
            toast.success('Company updated')
            setSheetOpen(false)
          },
          onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to update company')),
        },
      )
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          toast.success('Company created')
          setSheetOpen(false)
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to create company')),
      })
    }
  }

  return (
    <>
      <PageHeader
        title="Companies"
        subtitle="All client companies assigned to your catering service."
        action={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by company name"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            className="max-w-sm"
          />
          <Select
            value={filters.status}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, status: v as CompanyFilters['status'] }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-white shadow-sm">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-72 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : companies && companies.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3 text-center">Employees</th>
                  <th className="px-6 py-3">Order Management</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/companies/${company.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="truncate max-w-[200px]">
                          {company.deliveryLocation}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {company.contactName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {company.contactEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-700">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {company.employeeCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          company.selfManaged
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {company.selfManaged ? 'Self-managed' : 'Catering-managed'}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-medium tabular-nums ${
                        company.balance < 0
                          ? 'text-red-600'
                          : company.balance > 0
                            ? 'text-emerald-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {formatCurrency(company.balance)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!company.selfManaged && (
                          <button
                            onClick={() => handleEdit(company)}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        <Link
                          to={`/companies/${company.id}`}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={<Building2 className="h-12 w-12" />}
              title="No companies found"
              description={
                filters.search || filters.status !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No companies have been assigned yet.'
              }
            />
          )}
        </div>
      </div>

      <CompanySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        company={editCompany}
        onSubmit={handleSubmit}
        loading={createMut.isPending || updateMut.isPending}
      />
    </>
  )
}
