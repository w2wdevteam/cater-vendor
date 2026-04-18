import { useEffect, useCallback } from 'react'
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
import LocationPicker from '@/components/common/LocationPicker'
import type { Company } from '@/types/company.types'
import type { DeliveryLocation, LocationFormData } from '@/types/location.types'

const schema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
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
  fixedCompanyId?: string
  location?: DeliveryLocation | null
}

export default function LocationSheet({
  open,
  onOpenChange,
  companies,
  onSubmit,
  loading,
  fixedCompanyId,
  location,
}: LocationSheetProps) {
  const isEdit = !!location

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      address: '',
      lat: undefined,
      lng: undefined,
      companyId: '',
      contactPerson: '',
      notes: '',
    },
  })

  const currentLat = watch('lat')
  const currentLng = watch('lng')

  useEffect(() => {
    if (open && location) {
      reset({
        name: location.name,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        companyId: location.companyId,
        contactPerson: location.contactPerson ?? '',
        notes: location.notes ?? '',
      })
    } else if (open) {
      reset({
        name: '',
        address: '',
        lat: undefined,
        lng: undefined,
        companyId: fixedCompanyId ?? '',
        contactPerson: '',
        notes: '',
      })
    }
  }, [open, location, reset, fixedCompanyId])

  const handleLocationSelect = useCallback(
    (loc: { lat: number; lng: number; address: string }) => {
      setValue('address', loc.address, { shouldValidate: true })
      setValue('lat', loc.lat)
      setValue('lng', loc.lng)
    },
    [setValue],
  )

  const mapValue =
    currentLat != null && currentLng != null
      ? { lat: currentLat, lng: currentLng }
      : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Location' : 'Add Location'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update delivery location details.'
              : 'Add a delivery location for a catering-managed company.'}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-4 py-4">
            {!fixedCompanyId && !isEdit && (
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
            )}

            <div>
              <Label htmlFor="loc-name">Location Name *</Label>
              <Input id="loc-name" {...register('name')} className="mt-1.5" />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label>Pick Location on Map</Label>
              <div className="mt-1.5">
                <LocationPicker
                  value={mapValue}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="loc-address">Address *</Label>
              <Input
                id="loc-address"
                {...register('address')}
                className="mt-1.5"
                readOnly
                placeholder="Select a location on the map above"
              />
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
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
