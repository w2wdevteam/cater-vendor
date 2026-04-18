export interface AuditLogEntry {
  id: string
  action: string
  targetRecord: string
  performedBy: string
  timestamp: string
}

export interface AuditLogFilters {
  from?: string
  to?: string
  actionType?: string
  page?: number
  limit?: number
}

export interface AuditLogResponse {
  data: AuditLogEntry[]
  total: number
  page: number
  limit: number
}
