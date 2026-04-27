import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  cateringClientsApi,
  type ApiCateringClient,
  type CreateCateringClientBody,
  type UpdateCateringClientBody,
} from '@/api/endpoints/catering-clients.api'

export interface CateringClient {
  id: string
  name: string
  phone: string
  address: string
  locationLink?: string
  notes?: string
  balance: number
}

function mapClient(c: ApiCateringClient): CateringClient {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    locationLink: c.locationLink ?? undefined,
    notes: c.notes ?? undefined,
    balance: c.balance ?? 0,
  }
}

export interface CateringClientFilters {
  search?: string
}

/** Phone-prefix lookup for the order-creation combobox. */
export function useCateringClientsByPhone(phone: string, enabled: boolean) {
  return useQuery({
    queryKey: ['catering-clients', 'search', phone],
    queryFn: async () => {
      const rows = await cateringClientsApi.searchByPhone(phone)
      return rows.map(mapClient)
    },
    enabled: enabled && phone.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

/** Full list for the Clients admin page. */
export function useCateringClients(filters?: CateringClientFilters) {
  return useQuery({
    queryKey: ['catering-clients', 'list', filters ?? {}],
    queryFn: async () => {
      const res = await cateringClientsApi.list({
        search: filters?.search || undefined,
        limit: 100,
      })
      return res.data.map(mapClient)
    },
    placeholderData: keepPreviousData,
  })
}

export function useCreateCateringClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCateringClientBody) => cateringClientsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catering-clients'] })
    },
  })
}

export function useUpdateCateringClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCateringClientBody }) =>
      cateringClientsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catering-clients'] })
    },
  })
}

export function useDeleteCateringClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cateringClientsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catering-clients'] })
    },
  })
}
