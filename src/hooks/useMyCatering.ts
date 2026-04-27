import { useQuery } from '@tanstack/react-query'
import { cateringService } from '@/services/catering.service'
import { useAuthStore } from '@/store/auth.store'

const FIFTY_MINUTES_MS = 50 * 60 * 1000

/**
 * Loads the authenticated cater-admin's own catering — used by the layout
 * to render the platform logo and elsewhere for catering metadata.
 *
 * `logoUrl` is a 1-hour presigned MinIO URL from the backend. We refetch
 * every 50 minutes (and treat the data as stale at the same boundary) so
 * the URL is rotated before it expires.
 */
export function useMyCatering() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['account', 'catering'],
    queryFn: () => cateringService.getMyCatering(),
    enabled: isAuthenticated,
    staleTime: FIFTY_MINUTES_MS,
    refetchInterval: FIFTY_MINUTES_MS,
    refetchOnWindowFocus: true,
  })
}
