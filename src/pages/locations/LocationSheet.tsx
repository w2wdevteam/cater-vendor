import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Company } from '@/types/company.types'
import type { LocationFormData } from '@/types/location.types'

const schema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  companyId: z.string().min(1, 'Company is required'),
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
})

interface LocationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companies: Company[]
  onSubmit: (values: LocationFormData) => void
  loading?: boolean
}

export default function LocationSheet({
  open,
  onOpenChange,
  companies,
  onSubmit,
  loading,
}: LocationSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      address: '',
      companyId: '',
      contactPerson: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        address: '',
        companyId: '',
        contactPerson: '',
        notes: '',
      })
    }
  }, [open, reset])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Location</SheetTitle>
          <SheetDescription>
            Add a delivery location for a catering-managed company.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-4 py-4">
            <div>
              <Label>Company *</Label>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.companyId && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.companyId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="loc-name">Location Name *</Label>
              <Input id="loc-name" {...register('name')} className="mt-1.5" />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="loc-address">Address *</Label>
              <Input id="loc-address" {...register('address')} className="mt-1.5" />
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="loc-contact">Contact Person</Label>
              <Input
                id="loc-contact"
                {...register('contactPerson')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="loc-notes">Notes</Label>
              <Input id="loc-notes" {...register('notes')} className="mt-1.5" />
            </div>
          </div>

          <SheetFooter className="gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
