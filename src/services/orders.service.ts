import { ordersApi } from '@/api/endpoints/orders.api'
import type { KitchenPrepItem } from '@/types/order.types'

export async function getKitchenPrep(date?: string): Promise<KitchenPrepItem[]> {
  const rows = await ordersApi.kitchenPrep(date)
  return rows.map((r) => ({
    menuItemId: r.menuItemId,
    menuItemName: r.menuItemName,
    totalQuantity: r.totalQuantity,
  }))
}
