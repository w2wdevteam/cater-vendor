import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'
import type { ApiEntityStatus } from './companies.api'

// ── Menu items ────────────────────────────────────────────────────────────

export interface ApiMenuItem {
  id: string
  name: string
  description: string | null
  price: number
  dailyCap: number | null
  status: ApiEntityStatus
  cateringId: string
  imageId: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface MenuItemListQuery {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  search?: string
  status?: ApiEntityStatus
}

export interface CreateMenuItemBody {
  name: string
  description?: string
  price: number
  dailyCap?: number
}

export type UpdateMenuItemBody = Partial<CreateMenuItemBody>

// ── Menu assignments ──────────────────────────────────────────────────────

export interface ApiMenuAssignment {
  id: string
  date: string
  menuItemId: string
  menuItemName: string
  menuItemPrice: number
  menuItemImageUrl: string | null
  maxOrders: number | null
  effectiveCap: number | null
  currentOrderCount: number
  cateringId: string
  createdAt: string
  updatedAt: string
}

export interface AssignmentsQuery {
  dateFrom?: string
  dateTo?: string
}

export interface AssignMenuBody {
  assignments: Array<{ date: string; menuItemId: string; maxOrders?: number }>
}

export interface CopyDayBody {
  sourceDate: string
  targetDate: string
}

export interface CopyWeekBody {
  sourceWeekStart: string
  targetWeekStart: string
}

export interface CopyResult {
  created: number
  skipped: number
  skippedItems: string[]
}

// ── Menu templates ────────────────────────────────────────────────────────

export type WeekDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface ApiMenuTemplateSummary {
  id: string
  name: string
  isActive: boolean
  itemCount: number
  cateringId: string
  createdAt: string
  updatedAt: string
}

export interface ApiMenuTemplateDetail extends ApiMenuTemplateSummary {
  items: Record<
    WeekDayKey,
    { menuItemId: string; menuItemName: string; maxOrders: number | null }[]
  >
}

export interface TemplateItemBody {
  day: WeekDayKey
  menuItemId: string
  maxOrders?: number
}

export interface CreateTemplateBody {
  name: string
  isActive?: boolean
  items: TemplateItemBody[]
}

export interface UpdateTemplateBody {
  name?: string
  isActive?: boolean
  items?: TemplateItemBody[]
}

export const menusApi = {
  // Items
  listItems: (params: MenuItemListQuery = {}): Promise<ListResult<ApiMenuItem>> =>
    apiClient.get('/cater-admin/menu-items', { params }).then((r) => unwrapList<ApiMenuItem>(r)),

  getItem: (id: string): Promise<ApiMenuItem> =>
    apiClient.get<ApiMenuItem>(`/cater-admin/menu-items/${id}`).then(unwrap<ApiMenuItem>),

  createItem: (body: CreateMenuItemBody): Promise<ApiMenuItem> =>
    apiClient.post<ApiMenuItem>('/cater-admin/menu-items', body).then(unwrap<ApiMenuItem>),

  updateItem: (id: string, body: UpdateMenuItemBody): Promise<ApiMenuItem> =>
    apiClient.patch<ApiMenuItem>(`/cater-admin/menu-items/${id}`, body).then(unwrap<ApiMenuItem>),

  toggleItemStatus: (id: string, status: ApiEntityStatus): Promise<ApiMenuItem> =>
    apiClient
      .patch<ApiMenuItem>(`/cater-admin/menu-items/${id}/status`, { status })
      .then(unwrap<ApiMenuItem>),

  uploadItemImage: (id: string, file: File): Promise<ApiMenuItem> => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<ApiMenuItem>(`/cater-admin/menu-items/${id}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap<ApiMenuItem>)
  },

  removeItemImage: (id: string): Promise<void> =>
    apiClient.delete(`/cater-admin/menu-items/${id}/image`).then(() => undefined),

  // Assignments
  listAssignments: (params: AssignmentsQuery = {}): Promise<ApiMenuAssignment[]> =>
    apiClient
      .get<{ data: ApiMenuAssignment[] }>('/cater-admin/menu-assignments', { params })
      .then(unwrap<ApiMenuAssignment[]>),

  createAssignments: (body: AssignMenuBody): Promise<ApiMenuAssignment[]> =>
    apiClient
      .post<{ data: ApiMenuAssignment[] }>('/cater-admin/menu-assignments', body)
      .then(unwrap<ApiMenuAssignment[]>),

  updateAssignment: (id: string, body: { maxOrders?: number | null }): Promise<ApiMenuAssignment> =>
    apiClient
      .patch<ApiMenuAssignment>(`/cater-admin/menu-assignments/${id}`, body)
      .then(unwrap<ApiMenuAssignment>),

  removeAssignment: (id: string): Promise<void> =>
    apiClient.delete(`/cater-admin/menu-assignments/${id}`).then(() => undefined),

  copyDay: (body: CopyDayBody): Promise<CopyResult> =>
    apiClient
      .post<CopyResult>('/cater-admin/menu-assignments/copy-day', body)
      .then(unwrap<CopyResult>),

  copyWeek: (body: CopyWeekBody): Promise<CopyResult> =>
    apiClient
      .post<CopyResult>('/cater-admin/menu-assignments/copy-week', body)
      .then(unwrap<CopyResult>),

  // Templates
  listTemplates: (params: { page?: number; limit?: number; search?: string } = {}) =>
    apiClient
      .get('/cater-admin/menu-templates', { params })
      .then((r) => unwrapList<ApiMenuTemplateSummary>(r)),

  getTemplate: (id: string): Promise<ApiMenuTemplateDetail> =>
    apiClient
      .get<ApiMenuTemplateDetail>(`/cater-admin/menu-templates/${id}`)
      .then(unwrap<ApiMenuTemplateDetail>),

  createTemplate: (body: CreateTemplateBody): Promise<ApiMenuTemplateDetail> =>
    apiClient
      .post<ApiMenuTemplateDetail>('/cater-admin/menu-templates', body)
      .then(unwrap<ApiMenuTemplateDetail>),

  updateTemplate: (id: string, body: UpdateTemplateBody): Promise<ApiMenuTemplateDetail> =>
    apiClient
      .patch<ApiMenuTemplateDetail>(`/cater-admin/menu-templates/${id}`, body)
      .then(unwrap<ApiMenuTemplateDetail>),

  applyTemplate: (id: string, targetWeekStart: string) =>
    apiClient
      .post<{ created: number; skipped: number }>(
        `/cater-admin/menu-templates/${id}/apply`,
        { targetWeekStart },
      )
      .then(unwrap<{ created: number; skipped: number }>),
}
