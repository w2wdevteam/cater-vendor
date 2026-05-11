import {
  menusApi,
  type ApiMenuAssignment,
  type ApiMenuItem,
  type ApiMenuTemplateDetail,
  type WeekDayKey,
} from '@/api/endpoints/menus.api'
import type {
  DayAssignment,
  MenuItem,
  MenuItemFilters,
  MenuItemInput,
  MenuTemplate,
  TemplateItem,
  WeekDay,
} from '@/types/menu.types'

const DEFAULT_TEMPLATE_NAME = 'Weekly Template'

function mapItem(m: ApiMenuItem): MenuItem {
  return {
    id: m.id,
    name: m.name,
    description: m.description ?? undefined,
    price: m.price,
    imageUrl: m.imageUrl ?? undefined,
    dailyCap: m.dailyCap ?? undefined,
    status: m.status,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }
}

function assignmentsToDayAssignment(rows: ApiMenuAssignment[], date: string): DayAssignment {
  const items = rows
    .filter((r) => r.date === date)
    .map((r) => {
      const cap = r.effectiveCap ?? r.maxOrders ?? 0
      return {
        assignmentId: r.id,
        menuItem: {
          id: r.menuItemId,
          name: r.menuItemName,
          price: r.menuItemPrice,
          imageUrl: r.menuItemImageUrl ?? undefined,
          status: 'active' as const,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        },
        maxOrders: cap,
        currentOrders: r.currentOrderCount,
        isSoldOut: cap > 0 && r.currentOrderCount >= cap,
      }
    })
  return { date, items }
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function getMenuItems(filters: MenuItemFilters = {}): Promise<MenuItem[]> {
  const result = await menusApi.listItems({
    search: filters.search || undefined,
    status: filters.status && filters.status !== 'all' ? filters.status : undefined,
    limit: 100,
  })
  return result.data.map(mapItem).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getMenuItem(id: string): Promise<MenuItem> {
  return mapItem(await menusApi.getItem(id))
}

export async function createMenuItem(input: MenuItemInput): Promise<MenuItem> {
  return mapItem(
    await menusApi.createItem({
      name: input.name,
      description: input.description,
      price: input.price,
      dailyCap: input.dailyCap,
    }),
  )
}

export async function updateMenuItem(id: string, input: MenuItemInput): Promise<MenuItem> {
  return mapItem(
    await menusApi.updateItem(id, {
      name: input.name,
      description: input.description,
      price: input.price,
      dailyCap: input.dailyCap,
    }),
  )
}

export async function toggleMenuItemStatus(id: string): Promise<MenuItem> {
  const current = await menusApi.getItem(id)
  const next = current.status === 'active' ? 'inactive' : 'active'
  return mapItem(await menusApi.toggleItemStatus(id, next))
}

export async function uploadMenuItemImage(id: string, file: File): Promise<MenuItem> {
  return mapItem(await menusApi.uploadItemImage(id, file))
}

export async function removeMenuItemImage(id: string): Promise<void> {
  await menusApi.removeItemImage(id)
}

// ── Assignments ───────────────────────────────────────────────────────────

export async function getMonthAssignments(
  year: number,
  month: number,
): Promise<DayAssignment[]> {
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 0))
  const rows = await menusApi.listAssignments({
    dateFrom: toDateKey(start),
    dateTo: toDateKey(end),
  })
  const byDate = new Map<string, DayAssignment>()
  for (const r of rows) {
    if (!byDate.has(r.date)) byDate.set(r.date, { date: r.date, items: [] })
    byDate.get(r.date)!.items.push({
      assignmentId: r.id,
      menuItem: {
        id: r.menuItemId,
        name: r.menuItemName,
        price: r.menuItemPrice,
        imageUrl: r.menuItemImageUrl ?? undefined,
        status: 'active',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      },
      maxOrders: r.effectiveCap ?? r.maxOrders ?? 0,
      currentOrders: r.currentOrderCount,
      isSoldOut:
        (r.effectiveCap ?? r.maxOrders ?? 0) > 0 &&
        r.currentOrderCount >= (r.effectiveCap ?? r.maxOrders ?? 0),
    })
  }
  return Array.from(byDate.values())
}

export async function getDayAssignments(date: string): Promise<DayAssignment> {
  const rows = await menusApi.listAssignments({ dateFrom: date, dateTo: date })
  return assignmentsToDayAssignment(rows, date)
}

export async function addAssignment(
  date: string,
  menuItemId: string,
  maxOrders?: number,
): Promise<void> {
  await menusApi.createAssignments({
    assignments: [{ date, menuItemId, maxOrders }],
  })
}

export async function removeAssignment(assignmentId: string): Promise<void> {
  await menusApi.removeAssignment(assignmentId)
}

export async function updateAssignmentMaxOrders(
  assignmentId: string,
  maxOrders: number,
): Promise<void> {
  await menusApi.updateAssignment(assignmentId, { maxOrders })
}

export async function copyDay(sourceDate: string, targetDate: string): Promise<void> {
  await menusApi.copyDay({ sourceDate, targetDate })
}

export async function copyWeek(sourceWeekStart: string, targetWeekStart: string): Promise<void> {
  await menusApi.copyWeek({ sourceWeekStart, targetWeekStart })
}

// ── Templates (singleton convention) ──────────────────────────────────────

const emptyDays: Record<WeekDay, TemplateItem[]> = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
}

function templateToDomain(tmpl: ApiMenuTemplateDetail): MenuTemplate {
  const days: Record<WeekDay, TemplateItem[]> = { ...emptyDays }
  ;(Object.keys(days) as WeekDay[]).forEach((d) => {
    days[d] = (tmpl.items[d as WeekDayKey] ?? []).map((i) => ({
      menuItemId: i.menuItemId,
      // Backend returns maxOrders as number | null; we represent "no cap" as 0
      // in the domain type to keep the form working with a plain number input.
      maxOrders: i.maxOrders ?? 0,
    }))
  })
  return {
    id: tmpl.id,
    name: tmpl.name,
    isActive: tmpl.isActive,
    days,
    createdAt: tmpl.createdAt,
    updatedAt: tmpl.updatedAt,
  }
}

function freshEmptyDays(): Record<WeekDay, TemplateItem[]> {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  }
}

async function findSingleton(): Promise<ApiMenuTemplateDetail | null> {
  const list = await menusApi.listTemplates({ limit: 20 })
  if (list.data.length === 0) return null
  return menusApi.getTemplate(list.data[0].id)
}

function flattenDays(days: Record<WeekDay, TemplateItem[]>) {
  return (Object.entries(days) as [WeekDay, TemplateItem[]][]).flatMap(
    ([day, rows]) =>
      rows.map((ti) => ({
        day: day as WeekDayKey,
        menuItemId: ti.menuItemId,
        // Backend requires maxOrders >= 1 when provided; omit for "no cap".
        maxOrders: ti.maxOrders > 0 ? ti.maxOrders : undefined,
      })),
  )
}

export async function getTemplate(): Promise<MenuTemplate> {
  const singleton = await findSingleton()
  if (singleton) return templateToDomain(singleton)
  // No template on the server yet — render an empty draft so the user can
  // compose one. We'll POST to create it on first save (backend requires
  // items.length >= 1, so we don't auto-create an empty template).
  return {
    id: '',
    name: DEFAULT_TEMPLATE_NAME,
    isActive: true,
    days: freshEmptyDays(),
    createdAt: '',
    updatedAt: '',
  }
}

export async function updateTemplate(
  days: Record<WeekDay, TemplateItem[]>,
): Promise<MenuTemplate> {
  const items = flattenDays(days)
  const singleton = await findSingleton()
  if (!singleton) {
    if (items.length === 0) {
      throw new Error('Add at least one item before saving the template.')
    }
    return templateToDomain(
      await menusApi.createTemplate({
        name: DEFAULT_TEMPLATE_NAME,
        isActive: true,
        items,
      }),
    )
  }
  return templateToDomain(await menusApi.updateTemplate(singleton.id, { items }))
}

export async function applyTemplate(startDate: string): Promise<void> {
  const singleton = await findSingleton()
  if (!singleton) {
    throw new Error('No template to apply. Create one first.')
  }
  await menusApi.applyTemplate(singleton.id, startDate)
}
