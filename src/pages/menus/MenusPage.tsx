import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Plus, Search, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import DietaryTags from '@/components/common/DietaryTags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  useMenuItems,
  useToggleMenuItemStatus,
} from '@/hooks/useMenus'
import { DIETARY_TAGS, type DietaryTag, type MenuItemStatus } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

type StatusFilter = MenuItemStatus | 'all'
type TagFilter = DietaryTag | 'all'

function Thumbnail({ url, alt }: { url?: string; alt: string }) {
  if (!url) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-gray-400">
        <UtensilsCrossed className="h-5 w-5" />
      </div>
    )
  }
  return (
    <img
      src={url}
      alt={alt}
      className="h-12 w-12 rounded object-cover"
      loading="lazy"
    />
  )
}

export default function MenusPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [tag, setTag] = useState<TagFilter>('all')

  useEffect(() => {
    document.title = 'Menus — Catering Admin'
  }, [])

  const { data, isLoading } = useMenuItems({
    search: search.trim() || undefined,
    status,
    dietaryTag: tag,
  })
  const toggleStatus = useToggleMenuItemStatus()

  function handleToggle(id: string, currentStatus: MenuItemStatus) {
    toggleStatus.mutate(id, {
      onSuccess: () => {
        toast.success(
          currentStatus === 'active'
            ? 'Menu item deactivated'
            : 'Menu item reactivated',
        )
      },
      onError: () => toast.error('Failed to update status'),
    })
  }

  return (
    <>
      <PageHeader
        title="Menus"
        subtitle="All menu items available to offer."
        action={
          <Button onClick={() => navigate('/menus/create')}>
            <Plus className="h-4 w-4" />
            Create Menu Item
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tag} onValueChange={(v) => setTag(v as TagFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Dietary tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dietary tags</SelectItem>
            {Object.entries(DIETARY_TAGS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : data && data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Dietary
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Daily Cap
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr
                  key={m.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Thumbnail url={m.imageUrl} alt={m.name} />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">
                          {m.name}
                        </div>
                        {m.description && (
                          <div className="truncate text-xs text-gray-500 max-w-xs">
                            {m.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <DietaryTags tags={m.dietaryTags} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(m.price)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {m.dailyCap ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={m.status === 'active'}
                          onCheckedChange={() => handleToggle(m.id, m.status)}
                          disabled={toggleStatus.isPending}
                          aria-label={
                            m.status === 'active' ? 'Deactivate' : 'Reactivate'
                          }
                        />
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/menus/${m.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <EmptyState
            icon={<UtensilsCrossed className="h-12 w-12" />}
            title="No menu items found"
            description={
              search || status !== 'all' || tag !== 'all'
                ? 'Try adjusting your filters.'
                : 'Create your first menu item to get started.'
            }
            action={
              !search && status === 'all' && tag === 'all' ? (
                <Button onClick={() => navigate('/menus/create')}>
                  <Plus className="h-4 w-4" />
                  Create Menu Item
                </Button>
              ) : undefined
            }
          />
        </div>
      )}
    </>
  )
}
