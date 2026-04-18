import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Clock, Truck, PackageCheck, ShoppingCart } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useCutoffTime,
  useUpdateCutoffTime,
  useUpdateDeliveryStatus,
} from '@/hooks/useDeliveryConfig'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { DeliveryStatus } from '@/types/delivery-config.types'

const cutoffSchema = z.object({
  cutoffTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be a valid time (HH:MM)'),
})

type CutoffForm = z.infer<typeof cutoffSchema>

const statusOptions: {
  value: DeliveryStatus
  label: string
  icon: typeof ShoppingCart
  color: string
  activeColor: string
}[] = [
  {
    value: 'ordering_open',
    label: 'Ordering Open',
    icon: ShoppingCart,
    color: 'text-gray-500 border-gray-200 bg-white hover:bg-gray-50',
    activeColor: 'text-green-700 border-green-300 bg-green-50 ring-2 ring-green-200',
  },
  {
    value: 'on_the_way',
    label: 'On the Way',
    icon: Truck,
    color: 'text-gray-500 border-gray-200 bg-white hover:bg-gray-50',
    activeColor: 'text-amber-700 border-amber-300 bg-amber-50 ring-2 ring-amber-200',
  },
  {
    value: 'delivered',
    label: 'Delivered',
    icon: PackageCheck,
    color: 'text-gray-500 border-gray-200 bg-white hover:bg-gray-50',
    activeColor: 'text-blue-700 border-blue-300 bg-blue-50 ring-2 ring-blue-200',
  },
]

function CutoffSection() {
  const { data, isLoading } = useCutoffTime()
  const update = useUpdateCutoffTime()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingTime, setPendingTime] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CutoffForm>({
    resolver: zodResolver(cutoffSchema),
    values: { cutoffTime: data?.cutoffTime ?? '10:00' },
  })

  function onSubmit(values: CutoffForm) {
    setPendingTime(values.cutoffTime)
    setConfirmOpen(true)
  }

  function handleConfirm() {
    if (!pendingTime) return
    update.mutate(pendingTime, {
      onSuccess: () => {
        toast.success('Cutoff time updated')
        setConfirmOpen(false)
        reset({ cutoffTime: pendingTime })
        setPendingTime(null)
      },
      onError: () => {
        toast.error('Failed to update cutoff time')
      },
    })
  }

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
          <Clock className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900">
            Daily Order Cutoff
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            The time after which companies can no longer place orders for the
            current day.
          </p>

          {isLoading ? (
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-10 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 flex flex-wrap items-end gap-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="cutoffTime">Cutoff time</Label>
                <Input
                  id="cutoffTime"
                  type="time"
                  className="w-40"
                  {...register('cutoffTime')}
                />
                {errors.cutoffTime && (
                  <p className="text-xs text-red-600">
                    {errors.cutoffTime.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-500">
                  Currently:{' '}
                  <span className="font-medium text-gray-900">
                    {data ? formatTime(data.cutoffTime) : '—'}
                  </span>
                </span>
                <Button type="submit" disabled={!isDirty || update.isPending}>
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Change daily cutoff time?"
        description="Changing the cutoff time affects all companies. Ordering will close at the new time starting today."
        confirmLabel="Yes, update"
        loading={update.isPending}
        onConfirm={handleConfirm}
      />
    </section>
  )
}

function DeliveryStatusSection() {
  const { data, isLoading } = useCutoffTime()
  const updateStatus = useUpdateDeliveryStatus()

  const currentStatus = data?.deliveryStatus ?? 'ordering_open'

  function handleStatusChange(status: DeliveryStatus) {
    if (status === currentStatus) return
    updateStatus.mutate(status, {
      onSuccess: () => {
        const label = statusOptions.find((s) => s.value === status)?.label
        toast.success(`Status updated to "${label}"`)
      },
      onError: () => toast.error('Failed to update status'),
    })
  }

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
          <Truck className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900">
            Delivery Status
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update the current delivery status. This is visible across the platform.
          </p>

          {isLoading ? (
            <div className="mt-6 flex items-center gap-3">
              <div className="h-16 w-36 animate-pulse rounded bg-gray-100" />
              <div className="h-16 w-36 animate-pulse rounded bg-gray-100" />
              <div className="h-16 w-36 animate-pulse rounded bg-gray-100" />
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              {statusOptions.map((opt) => {
                const Icon = opt.icon
                const isActive = currentStatus === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={updateStatus.isPending}
                    onClick={() => handleStatusChange(opt.value)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition-all',
                      isActive ? opt.activeColor : opt.color,
                      updateStatus.isPending && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function DeliveryConfigPage() {
  useEffect(() => {
    document.title = 'Delivery Config — Catering Admin'
  }, [])

  return (
    <>
      <PageHeader
        title="Delivery Configuration"
        subtitle="Manage cutoff time and delivery status."
      />

      <div className="space-y-8">
        <CutoffSection />
        <DeliveryStatusSection />
      </div>
    </>
  )
}
