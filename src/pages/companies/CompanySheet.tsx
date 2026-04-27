import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Company, CompanyFormData } from '@/types/company.types'

const schema = z.object({
  name: z.string().min(1, 'Company name is required'),
  contactPhone: z.string().min(1, 'Phone is required'),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  deliveryWindowStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM')
    .optional()
    .or(z.literal('')),
  deliveryWindowEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM')
    .optional()
    .or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface CompanySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company | null
  onSubmit: (values: CompanyFormData) => void
  loading?: boolean
}

export default function CompanySheet({
  open,
  onOpenChange,
  company,
  onSubmit,
  loading,
}: CompanySheetProps) {
  const isEdit = !!company

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      deliveryWindowStart: '',
      deliveryWindowEnd: '',
    },
  })

  useEffect(() => {
    if (open && company) {
      reset({
        name: company.name,
        contactName: company.contactName,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        address: company.deliveryLocation,
        deliveryWindowStart: company.deliveryWindowStart,
        deliveryWindowEnd: company.deliveryWindowEnd,
      })
    } else if (open) {
      reset({
        name: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        deliveryWindowStart: '',
        deliveryWindowEnd: '',
      })
    }
  }, [open, company, reset])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Company' : 'Add Company'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update company details.' : 'Add a new catering-managed company.'}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit((v) => onSubmit(v))}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-4 py-4">
            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input id="company-name" {...register('name')} className="mt-1.5" />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="company-phone">Phone *</Label>
              <Input
                id="company-phone"
                type="tel"
                placeholder="+998901234567"
                {...register('contactPhone')}
                className="mt-1.5"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="company-contact">Contact Person</Label>
              <Input
                id="company-contact"
                {...register('contactName')}
                className="mt-1.5"
              />
              {errors.contactName && (
                <p className="mt-1 text-xs text-red-500">{errors.contactName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                {...register('contactEmail')}
                className="mt-1.5"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-xs text-red-500">{errors.contactEmail.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="company-address">Address</Label>
              <Input id="company-address" {...register('address')} className="mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="company-window-start">Delivery Window Start</Label>
                <Input
                  id="company-window-start"
                  type="time"
                  {...register('deliveryWindowStart')}
                  className="mt-1.5"
                />
                {errors.deliveryWindowStart && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.deliveryWindowStart.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="company-window-end">Delivery Window End</Label>
                <Input
                  id="company-window-end"
                  type="time"
                  {...register('deliveryWindowEnd')}
                  className="mt-1.5"
                />
                {errors.deliveryWindowEnd && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.deliveryWindowEnd.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
