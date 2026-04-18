import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  addAssignment,
  applyTemplate,
  copyDay,
  copyWeek,
  createMenuItem,
  getDayAssignments,
  getMenuItem,
  getMenuItems,
  getMonthAssignments,
  getTemplate,
  removeAssignment,
  toggleMenuItemStatus,
  updateMenuItem,
  updateTemplate,
} from '@/services/menus.service'
import type {
  MenuItemFilters,
  MenuItemInput,
  TemplateItem,
  WeekDay,
} from '@/types/menu.types'

export function useMenuItems(filters: MenuItemFilters = {}) {
  return useQuery({
    queryKey: ['menu-items', filters],
    queryFn: () => getMenuItems(filters),
    placeholderData: keepPreviousData,
  })
}

export function useMenuItem(id: string | undefined) {
  return useQuery({
    queryKey: ['menu-items', 'detail', id],
    queryFn: () => getMenuItem(id!),
    enabled: !!id,
  })
}

export function useCreateMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: MenuItemInput) => createMenuItem(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}

export function useUpdateMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MenuItemInput }) =>
      updateMenuItem(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}

export function useToggleMenuItemStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toggleMenuItemStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}

export function useMonthAssignments(year: number, month: number) {
  return useQuery({
    queryKey: ['menu-assignments', 'month', year, month],
    queryFn: () => getMonthAssignments(year, month),
    placeholderData: keepPreviousData,
  })
}

export function useDayAssignments(date: string | null) {
  return useQuery({
    queryKey: ['menu-assignments', 'day', date],
    queryFn: () => getDayAssignments(date!),
    enabled: !!date,
  })
}

export function useAddAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ date, menuItemId, maxOrders }: { date: string; menuItemId: string; maxOrders?: number }) =>
      addAssignment(date, menuItemId, maxOrders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-assignments'] })
    },
  })
}

export function useRemoveAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: string) => removeAssignment(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-assignments'] })
    },
  })
}

export function useCopyDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      sourceDate,
      targetDate,
    }: {
      sourceDate: string
      targetDate: string
    }) => copyDay(sourceDate, targetDate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-assignments'] })
    },
  })
}

export function useCopyWeek() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      sourceWeekStart,
      targetWeekStart,
    }: {
      sourceWeekStart: string
      targetWeekStart: string
    }) => copyWeek(sourceWeekStart, targetWeekStart),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-assignments'] })
    },
  })
}

export function useTemplate() {
  return useQuery({
    queryKey: ['menu-template'],
    queryFn: getTemplate,
  })
}

export function useUpdateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (days: Record<WeekDay, TemplateItem[]>) => updateTemplate(days),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-template'] })
    },
  })
}

export function useApplyTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (startDate: string) => applyTemplate(startDate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-assignments'] })
    },
  })
}
