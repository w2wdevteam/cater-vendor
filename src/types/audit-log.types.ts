export interface AuditLogEntry {
  id: string
  action: string
  targetRecord: string
  performedBy: string
  timestamp: string
}

export interface AuditLogFilters {
  dateFrom?: string
  dateTo?: string
  action?: string
  entityType?: string
  entityId?: string
  performedById?: string
  search?: string
  page?: number
  limit?: number
}

export interface AuditLogResponse {
  data: AuditLogEntry[]
  total: number
  page: number
  limit: number
}
