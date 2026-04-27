import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'

export interface ApiCatering {
  id: string
  name: string
  address: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  status: 'active' | 'inactive'
  cutoffTime: string | null
  gmt: number
  logoId: string | null
  logoUrl: string | null
}

export interface ApiAuditLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string | null
  description: string | null
  performedBy: {
    id: string
    fullName: string
  } | null
  performedById: string | null
  performedByName: string | null
  createdAt: string
}

export interface AuditLogQuery {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  search?: string
  action?: string
  entityType?: string
  entityId?: string
  performedById?: string
  dateFrom?: string
  dateTo?: string
}

export const accountApi = {
  catering: () =>
    apiClient.get<ApiCatering>('/cater-admin/account/catering').then(unwrap<ApiCatering>),

  auditLogs: (params: AuditLogQuery = {}): Promise<ListResult<ApiAuditLogEntry>> =>
    apiClient
      .get('/cater-admin/account/audit-logs', { params })
      .then((r) => unwrapList<ApiAuditLogEntry>(r)),
}
