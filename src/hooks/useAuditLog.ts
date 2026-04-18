import { useQuery } from '@tanstack/react-query'
import { getAuditLog } from '@/services/audit-log.service'
import type { AuditLogFilters } from '@/types/audit-log.types'

export function useAuditLog(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['auditLog', filters],
    queryFn: () => getAuditLog(filters),
  })
}
