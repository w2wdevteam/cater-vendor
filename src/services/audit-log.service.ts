import type { AuditLogEntry, AuditLogFilters, AuditLogResponse } from '@/types/audit-log.types'

const mockAuditLog: AuditLogEntry[] = [
  { id: '1', action: 'Menu created', targetRecord: 'Grilled Chicken Bowl', performedBy: 'Catering Manager', timestamp: '2026-04-18T14:30:00Z' },
  { id: '2', action: 'Order approved', targetRecord: 'Order #ORD-1042', performedBy: 'Catering Manager', timestamp: '2026-04-18T13:15:00Z' },
  { id: '3', action: 'Company created', targetRecord: 'TechCorp International', performedBy: 'Catering Manager', timestamp: '2026-04-18T11:00:00Z' },
  { id: '4', action: 'Order rejected', targetRecord: 'Order #ORD-1038', performedBy: 'Lisa Wang', timestamp: '2026-04-17T16:45:00Z' },
  { id: '5', action: 'Pricing updated', targetRecord: 'GreenLeaf Solutions', performedBy: 'Catering Manager', timestamp: '2026-04-17T15:20:00Z' },
  { id: '6', action: 'Not delivered approved', targetRecord: 'NDR #NDR-2', performedBy: 'Catering Manager', timestamp: '2026-04-17T14:00:00Z' },
  { id: '7', action: 'Password changed', targetRecord: 'Catering Manager', performedBy: 'Catering Manager', timestamp: '2026-04-17T10:30:00Z' },
  { id: '8', action: 'Menu updated', targetRecord: 'Veggie Wrap Combo', performedBy: 'Lisa Wang', timestamp: '2026-04-16T09:00:00Z' },
  { id: '9', action: 'Department created', targetRecord: 'Engineering (TechCorp)', performedBy: 'Catering Manager', timestamp: '2026-04-16T08:30:00Z' },
  { id: '10', action: 'Company updated', targetRecord: 'Sunrise Marketing', performedBy: 'Catering Manager', timestamp: '2026-04-15T16:00:00Z' },
  { id: '11', action: 'Menu created', targetRecord: 'Salmon Teriyaki', performedBy: 'Lisa Wang', timestamp: '2026-04-15T14:30:00Z' },
  { id: '12', action: 'Order approved', targetRecord: 'Order #ORD-1030', performedBy: 'Catering Manager', timestamp: '2026-04-15T11:00:00Z' },
  { id: '13', action: 'Order approved', targetRecord: 'Order #ORD-1029', performedBy: 'Catering Manager', timestamp: '2026-04-15T10:45:00Z' },
  { id: '14', action: 'Admin created', targetRecord: 'Tom Harris', performedBy: 'Catering Manager', timestamp: '2026-04-14T09:15:00Z' },
  { id: '15', action: 'Not delivered rejected', targetRecord: 'NDR #NDR-3', performedBy: 'Lisa Wang', timestamp: '2026-04-14T15:45:00Z' },
  { id: '16', action: 'Delivery config updated', targetRecord: 'Cutoff Time', performedBy: 'Catering Manager', timestamp: '2026-04-13T11:00:00Z' },
  { id: '17', action: 'Order rejected', targetRecord: 'Order #ORD-1020', performedBy: 'Catering Manager', timestamp: '2026-04-13T09:30:00Z' },
  { id: '18', action: 'Admin deactivated', targetRecord: 'Tom Harris', performedBy: 'Catering Manager', timestamp: '2026-04-12T14:00:00Z' },
  { id: '19', action: 'Menu updated', targetRecord: 'Classic Caesar Salad', performedBy: 'Lisa Wang', timestamp: '2026-04-12T10:00:00Z' },
  { id: '20', action: 'Department created', targetRecord: 'Sales (Sunrise Marketing)', performedBy: 'Catering Manager', timestamp: '2026-04-11T09:00:00Z' },
  { id: '21', action: 'Company created', targetRecord: 'GreenLeaf Solutions', performedBy: 'Catering Manager', timestamp: '2026-04-11T08:30:00Z' },
  { id: '22', action: 'Pricing updated', targetRecord: 'TechCorp International', performedBy: 'Catering Manager', timestamp: '2026-04-10T16:00:00Z' },
  { id: '23', action: 'Menu created', targetRecord: 'BBQ Pulled Pork', performedBy: 'Lisa Wang', timestamp: '2026-04-10T11:00:00Z' },
  { id: '24', action: 'Order approved', targetRecord: 'Order #ORD-1005', performedBy: 'Catering Manager', timestamp: '2026-04-09T10:30:00Z' },
  { id: '25', action: 'Delivery config updated', targetRecord: 'Delivery Windows', performedBy: 'Catering Manager', timestamp: '2026-04-09T09:00:00Z' },
]

export const AUDIT_ACTION_TYPES = [
  'Menu created',
  'Menu updated',
  'Company created',
  'Company updated',
  'Department created',
  'Order approved',
  'Order rejected',
  'Not delivered approved',
  'Not delivered rejected',
  'Pricing updated',
  'Admin created',
  'Admin deactivated',
  'Password changed',
  'Delivery config updated',
]

export async function getAuditLog(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
  await new Promise((r) => setTimeout(r, 400))

  let filtered = [...mockAuditLog]

  if (filters.actionType) {
    filtered = filtered.filter((e) => e.action === filters.actionType)
  }

  if (filters.from) {
    const from = new Date(filters.from)
    filtered = filtered.filter((e) => new Date(e.timestamp) >= from)
  }

  if (filters.to) {
    const to = new Date(filters.to + 'T23:59:59')
    filtered = filtered.filter((e) => new Date(e.timestamp) <= to)
  }

  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const start = (page - 1) * limit

  return {
    data: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  }
}
