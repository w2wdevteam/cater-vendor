import type {
  DayAssignment,
  MenuAssignment,
  MenuItem,
  MenuItemFilters,
  MenuItemInput,
  MenuTemplate,
  TemplateItem,
  WeekDay,
} from '@/types/menu.types'

let menuItemsState: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Rice',
    description: 'Steamed jasmine rice with poached chicken, ginger scallion sauce.',
    price: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    dailyCap: 50,
    status: 'active',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Beef Noodles',
    description: 'Slow-braised beef brisket over hand-pulled noodles in rich broth.',
    price: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    dailyCap: 40,
    status: 'active',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Veggie Wrap',
    description: 'Whole-grain wrap with hummus, roasted vegetables, and mixed greens.',
    price: 22000,
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    dailyCap: 20,
    status: 'active',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Grilled Salmon Bowl',
    description: 'Atlantic salmon with quinoa, avocado, and seasonal vegetables.',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    dailyCap: 30,
    status: 'active',
    createdAt: '2026-03-05T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },
  {
    id: '5',
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons, anchovy-garlic dressing.',
    price: 20000,
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
    dailyCap: 25,
    status: 'active',
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: '6',
    name: 'Almond Crusted Tofu',
    description: 'Crispy almond-coated tofu with sesame ginger glaze.',
    price: 24000,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    status: 'inactive',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
]

let assignmentsState: MenuAssignment[] = (() => {
  const today = new Date()
  const list: MenuAssignment[] = []
  let counter = 1
  for (let offset = -7; offset <= 14; offset++) {
    const d = new Date(today)
    d.setDate(today.getDate() + offset)
    const date = d.toISOString().slice(0, 10)
    const weekday = d.getDay()
    const pool =
      weekday % 3 === 0
        ? ['1', '2', '5']
        : weekday % 3 === 1
          ? ['2', '3', '4']
          : ['1', '3', '5']
    for (const menuItemId of pool) {
      const item = menuItemsState.find((m) => m.id === menuItemId)
      list.push({
        id: String(counter++),
        date,
        menuItemId,
        maxOrders: item?.dailyCap ?? 50,
        currentOrders:
          offset === 0 && menuItemId === '1'
            ? 50
            : Math.floor(Math.random() * 30),
      })
    }
  }
  return list
})()

let templateState: MenuTemplate = {
  id: 'template-1',
  name: 'Standard Week',
  isActive: true,
  days: {
    monday: [{ menuItemId: '1', maxOrders: 50 }, { menuItemId: '3', maxOrders: 20 }],
    tuesday: [{ menuItemId: '2', maxOrders: 40 }, { menuItemId: '5', maxOrders: 25 }],
    wednesday: [{ menuItemId: '1', maxOrders: 50 }, { menuItemId: '4', maxOrders: 30 }],
    thursday: [{ menuItemId: '3', maxOrders: 20 }, { menuItemId: '5', maxOrders: 25 }],
    friday: [{ menuItemId: '2', maxOrders: 40 }, { menuItemId: '4', maxOrders: 30 }],
    saturday: [],
    sunday: [],
  },
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export async function getMenuItems(
  filters: MenuItemFilters = {},
): Promise<MenuItem[]> {
  await delay()
  let list = [...menuItemsState]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter((m) => m.name.toLowerCase().includes(q))
  }
  if (filters.status && filters.status !== 'all') {
    list = list.filter((m) => m.status === filters.status)
  }
  return list.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getMenuItem(id: string): Promise<MenuItem> {
  await delay()
  const item = menuItemsState.find((m) => m.id === id)
  if (!item) throw new Error('Menu item not found')
  return { ...item }
}

export async function createMenuItem(input: MenuItemInput): Promise<MenuItem> {
  await delay(600)
  const now = new Date().toISOString()
  const item: MenuItem = {
    id: uid(),
    ...input,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }
  menuItemsState = [...menuItemsState, item]
  return { ...item }
}

export async function updateMenuItem(
  id: string,
  input: MenuItemInput,
): Promise<MenuItem> {
  await delay(600)
  menuItemsState = menuItemsState.map((m) =>
    m.id === id ? { ...m, ...input, updatedAt: new Date().toISOString() } : m,
  )
  const updated = menuItemsState.find((m) => m.id === id)
  if (!updated) throw new Error('Menu item not found')
  return { ...updated }
}

export async function toggleMenuItemStatus(id: string): Promise<MenuItem> {
  await delay()
  menuItemsState = menuItemsState.map((m) =>
    m.id === id
      ? {
          ...m,
          status: m.status === 'active' ? 'inactive' : 'active',
          updatedAt: new Date().toISOString(),
        }
      : m,
  )
  const updated = menuItemsState.find((m) => m.id === id)
  if (!updated) throw new Error('Menu item not found')
  return { ...updated }
}

export async function getMonthAssignments(
  year: number,
  month: number,
): Promise<DayAssignment[]> {
  await delay()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  const startStr = start.toISOString().slice(0, 10)
  const endStr = end.toISOString().slice(0, 10)
  const relevant = assignmentsState.filter(
    (a) => a.date >= startStr && a.date <= endStr,
  )
  const byDate = new Map<string, DayAssignment>()
  for (const a of relevant) {
    const item = menuItemsState.find((m) => m.id === a.menuItemId)
    if (!item) continue
    const entry = byDate.get(a.date) ?? { date: a.date, items: [] }
    entry.items.push({
      assignmentId: a.id,
      menuItem: item,
      maxOrders: a.maxOrders,
      currentOrders: a.currentOrders,
      isSoldOut: a.currentOrders >= a.maxOrders,
    })
    byDate.set(a.date, entry)
  }
  return Array.from(byDate.values())
}

export async function getDayAssignments(date: string): Promise<DayAssignment> {
  await delay()
  const relevant = assignmentsState.filter((a) => a.date === date)
  const items = relevant
    .map((a) => {
      const item = menuItemsState.find((m) => m.id === a.menuItemId)
      if (!item) return null
      return {
        assignmentId: a.id,
        menuItem: item,
        maxOrders: a.maxOrders,
        currentOrders: a.currentOrders,
        isSoldOut: a.currentOrders >= a.maxOrders,
      }
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)
  return { date, items }
}

export async function addAssignment(
  date: string,
  menuItemId: string,
  maxOrders?: number,
): Promise<void> {
  await delay()
  if (
    assignmentsState.some(
      (a) => a.date === date && a.menuItemId === menuItemId,
    )
  ) {
    return
  }
  const item = menuItemsState.find((m) => m.id === menuItemId)
  const cap = maxOrders ?? item?.dailyCap ?? 50
  assignmentsState = [
    ...assignmentsState,
    { id: uid(), date, menuItemId, maxOrders: cap, currentOrders: 0 },
  ]
}

export async function removeAssignment(assignmentId: string): Promise<void> {
  await delay()
  assignmentsState = assignmentsState.filter((a) => a.id !== assignmentId)
}

export async function copyDay(
  sourceDate: string,
  targetDate: string,
): Promise<void> {
  await delay(500)
  const source = assignmentsState.filter((a) => a.date === sourceDate)
  assignmentsState = assignmentsState.filter((a) => a.date !== targetDate)
  for (const a of source) {
    assignmentsState.push({
      id: uid(),
      date: targetDate,
      menuItemId: a.menuItemId,
      maxOrders: a.maxOrders,
      currentOrders: 0,
    })
  }
}

export async function copyWeek(
  sourceWeekStart: string,
  targetWeekStart: string,
): Promise<void> {
  await delay(600)
  const src = new Date(sourceWeekStart)
  const tgt = new Date(targetWeekStart)
  for (let i = 0; i < 7; i++) {
    const s = new Date(src)
    s.setDate(src.getDate() + i)
    const t = new Date(tgt)
    t.setDate(tgt.getDate() + i)
    const sStr = s.toISOString().slice(0, 10)
    const tStr = t.toISOString().slice(0, 10)
    const source = assignmentsState.filter((a) => a.date === sStr)
    assignmentsState = assignmentsState.filter((a) => a.date !== tStr)
    for (const a of source) {
      assignmentsState.push({
        id: uid(),
        date: tStr,
        menuItemId: a.menuItemId,
        maxOrders: a.maxOrders,
        currentOrders: 0,
      })
    }
  }
}

export async function getTemplate(): Promise<MenuTemplate> {
  await delay()
  return JSON.parse(JSON.stringify(templateState))
}

export async function updateTemplate(
  days: Record<WeekDay, TemplateItem[]>,
): Promise<MenuTemplate> {
  await delay(600)
  templateState = {
    ...templateState,
    days,
    updatedAt: new Date().toISOString(),
  }
  return JSON.parse(JSON.stringify(templateState))
}

export async function applyTemplate(startDate: string): Promise<void> {
  await delay(800)
  const dayKeys: WeekDay[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  const start = new Date(startDate)
  for (let i = 0; i < 14; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dStr = d.toISOString().slice(0, 10)
    const key = dayKeys[d.getDay()]
    const items = templateState.days[key]
    assignmentsState = assignmentsState.filter((a) => a.date !== dStr)
    for (const ti of items) {
      assignmentsState.push({
        id: uid(),
        date: dStr,
        menuItemId: ti.menuItemId,
        maxOrders: ti.maxOrders,
        currentOrders: 0,
      })
    }
  }
}
