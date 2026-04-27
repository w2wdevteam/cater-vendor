import { accountApi, type ApiAuditLogEntry } from '@/api/endpoints/account.api'
import type { AuditLogEntry, AuditLogFilters, AuditLogResponse } from '@/types/audit-log.types'

export const AUDIT_ACTION_TYPES = [
  'LOGIN',
  'LOGOUT',
  'PASSWORD_CHANGED',
  'MENU_CREATED',
  'MENU_UPDATED',
  'MENU_DELETED',
  'MENU_ASSIGNMENT_CREATED',
  'MENU_ASSIGNMENT_UPDATED',
  'MENU_ASSIGNMENT_DELETED',
  'MENU_TEMPLATE_CREATED',
  'MENU_TEMPLATE_APPLIED',
  'ORDER_APPROVED',
  'ORDER_REJECTED',
  'LOCATION_CREATED',
  'LOCATION_UPDATED',
  'LOCATION_STATUS_CHANGED',
  'NOT_DELIVERED_APPROVED',
  'NOT_DELIVERED_REJECTED',
  'PRICING_OVERRIDE_CREATED',
  'PRICING_OVERRIDE_UPDATED',
  'PRICING_OVERRIDE_DELETED',
  'DELIVERY_CONFIG_UPDATED',
  'DELIVERY_STATUS_TOGGLED',
]

function mapEntry(entry: ApiAuditLogEntry): AuditLogEntry {
  const performer =
    entry.performedBy?.fullName ??
    entry.performedByName ??
    (entry.performedById ? 'Unknown admin' : 'System')
  const target = entry.description ?? `${entry.entityType}${entry.entityId ? ` #${entry.entityId}` : ''}`
  return {
    id: entry.id,
    action: entry.action,
    targetRecord: target,
    performedBy: performer,
    timestamp: entry.createdAt,
  }
}

export async function getAuditLog(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
  const { page = 1, limit = 20 } = filters
  const result = await accountApi.auditLogs({
    page,
    limit,
    search: filters.search,
    action: filters.action,
    entityType: filters.entityType,
    entityId: filters.entityId,
    performedById: filters.performedById,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  })
  return {
    data: result.data.map(mapEntry),
    total: result.meta.total,
    page: result.meta.page,
    limit: result.meta.limit,
  }
}
