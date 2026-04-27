import { accountApi, type ApiCatering } from '@/api/endpoints/account.api'
import type { MyCatering } from '@/types/catering.types'

function mapCatering(api: ApiCatering): MyCatering {
  return {
    id: api.id,
    name: api.name,
    address: api.address,
    contactName: api.contactName,
    contactEmail: api.contactEmail,
    contactPhone: api.contactPhone,
    status: api.status,
    cutoffTime: api.cutoffTime,
    gmt: api.gmt,
    logoId: api.logoId,
    logoUrl: api.logoUrl,
  }
}

export const cateringService = {
  async getMyCatering(): Promise<MyCatering> {
    const data = await accountApi.catering()
    return mapCatering(data)
  },
}
