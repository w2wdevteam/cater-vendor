export type CateringStatus = 'active' | 'inactive'

/**
 * The cater-admin's own catering — returned by `GET /cater-admin/account/catering`.
 * `logoUrl` is a 1-hour presigned MinIO URL; refetch periodically.
 */
export interface MyCatering {
  id: string
  name: string
  address: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  status: CateringStatus
  cutoffTime: string | null
  gmt: number
  logoId: string | null
  logoUrl: string | null
}
