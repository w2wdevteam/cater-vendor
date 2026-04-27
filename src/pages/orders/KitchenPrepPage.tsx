import { useEffect, useState } from 'react'
import { ChefHat, Printer, UtensilsCrossed } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { useKitchenPrep } from '@/hooks/useOrders'
import { formatDate } from '@/lib/utils'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function KitchenPrepPage() {
  const [date, setDate] = useState<string>(todayKey())
  const { data: items, isLoading } = useKitchenPrep(date)
  const totalItems = items?.reduce((sum, i) => sum + i.totalQuantity, 0) ?? 0
  const isToday = date === todayKey()

  useEffect(() => {
    document.title = 'Kitchen Prep — Catering Admin'
  }, [])

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title="Kitchen Prep Sheet"
          subtitle="Aggregated quantities for a day's kitchen preparation."
          action={
            <div className="flex items-center gap-2">
              <DatePicker
                value={date}
                onChange={(v) => setDate(v || todayKey())}
                placeholder="Pick a date"
                className="w-[200px]"
              />
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          }
        />
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kitchen Prep Sheet</h1>
        <p className="text-sm text-gray-500">
          {formatDate(date, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5">
                <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
                <div className="ml-auto h-10 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ) : items && items.length > 0 ? (
        <>
          <div className="mb-4 flex items-center gap-6 rounded-lg border bg-white px-6 py-4 shadow-sm print:border-gray-300">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Menu items</span>
              <span className="text-sm font-semibold text-gray-900">
                {items.length}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Total to prepare</span>
              <span className="text-sm font-semibold text-gray-900">
                {totalItems}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Date</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatDate(date, 'EEEE, MMM d')}
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm print:border-gray-300 print:shadow-none">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 print:bg-white">
                  <th className="px-6 py-3 w-8 text-center">#</th>
                  <th className="px-6 py-3">Menu Item</th>
                  <th className="px-6 py-3 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, idx) => (
                  <tr
                    key={item.menuItemId}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-center text-xs font-medium text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {item.menuItemImageUrl ? (
                          <img
                            src={item.menuItemImageUrl}
                            alt=""
                            className="h-16 w-16 rounded-lg object-cover print:h-10 print:w-10"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 print:h-10 print:w-10">
                            <UtensilsCrossed className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                        <span className="text-base font-medium text-gray-900 print:text-sm">
                          {item.menuItemName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-2xl font-bold tabular-nums text-primary-600 print:bg-transparent print:text-xl">
                        {item.totalQuantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-gray-50 print:bg-white">
                  <td className="px-6 py-4" />
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold tabular-nums text-white print:bg-transparent print:text-gray-900 print:text-xl">
                      {totalItems}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-xl border bg-white py-16 text-center shadow-sm">
          <ChefHat className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">
            Nothing to prepare
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {isToday
              ? 'No orders have been placed for today yet.'
              : `No orders for ${formatDate(date, 'MMM d, yyyy')}.`}
          </p>
        </div>
      )}
    </>
  )
}
