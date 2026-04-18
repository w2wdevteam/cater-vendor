import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLocations, createLocation } from '@/services/locations.service'
import type { LocationFormData } from '@/types/location.types'

export function useLocations(companyId?: string) {
  return useQuery({
    queryKey: ['locations', companyId],
    queryFn: () => getLocations(companyId),
  })
}

export function useCreateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LocationFormData) => createLocation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}
