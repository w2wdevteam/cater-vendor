import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Info } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import ImageUpload from '@/components/common/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  useMenuItem,
  useRemoveMenuItemImage,
  useToggleMenuItemStatus,
  useUpdateMenuItem,
  useUploadMenuItemImage,
} from '@/hooks/useMenus'
import { getApiErrorMessage } from '@/lib/api-errors'

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z
    .number({ message: 'Price is required' })
    .positive('Price must be greater than 0'),
  dailyCap: z
    .number()
    .int()
    .positive('Daily cap must be greater than 0')
    .optional(),
})

type FormValues = z.infer<typeof menuItemSchema>

export default function MenuEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useMenuItem(id)
  const update = useUpdateMenuItem()
  const uploadImage = useUploadMenuItemImage()
  const removeImage = useRemoveMenuItemImage()
  const toggleStatus = useToggleMenuItemStatus()

  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [clearExistingImage, setClearExistingImage] = useState(false)

  useEffect(() => {
    document.title = 'Edit Menu Item — Catering Admin'
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined as unknown as number,
      dailyCap: undefined,
    },
  })

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        description: data.description ?? '',
        price: data.price,
        dailyCap: data.dailyCap,
      })
      setPendingImage(null)
      setClearExistingImage(false)
    }
  }, [data, reset])

  const hasImageChange =
    pendingImage !== null || (clearExistingImage && !!data?.imageUrl)

  async function onSubmit(values: FormValues) {
    if (!id) return
    try {
      if (isDirty) {
        await update.mutateAsync({
          id,
          input: {
            name: values.name,
            description: values.description,
            price: values.price,
            dailyCap: values.dailyCap,
          },
        })
      }
      if (pendingImage) {
        await uploadImage.mutateAsync({ id, file: pendingImage })
      } else if (clearExistingImage && data?.imageUrl) {
        await removeImage.mutateAsync(id)
      }
      toast.success('Menu item updated')
      navigate('/menus')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update menu item'))
    }
  }

  function handleToggleStatus() {
    if (!id || !data) return
    toggleStatus.mutate(id, {
      onSuccess: () => {
        toast.success(
          data.status === 'active'
            ? 'Menu item deactivated'
            : 'Menu item reactivated',
        )
      },
      onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to update status')),
    })
  }

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Edit Menu Item" />
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-100" />
            <div className="h-40 w-40 animate-pulse rounded bg-gray-100" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </>
    )
  }

  const isBusy =
    update.isPending || uploadImage.isPending || removeImage.isPending
  const previewUrl = clearExistingImage ? null : data.imageUrl ?? null

  return (
    <>
      <PageHeader
        title="Edit Menu Item"
        subtitle={data.name}
        action={
          <Button variant="outline" onClick={() => navigate('/menus')}>
            <ArrowLeft className="h-4 w-4" />
            Back to menus
          </Button>
        }
      />

      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Status</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {data.status === 'active'
                ? 'Active — available for assignment and ordering.'
                : 'Inactive — hidden from order flow.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {data.status === 'active' ? 'Active' : 'Inactive'}
            </span>
            <Switch
              checked={data.status === 'active'}
              onCheckedChange={handleToggleStatus}
              disabled={toggleStatus.isPending}
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-lg border bg-white p-6 shadow-sm"
        >
          <div className="flex items-start gap-3 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Changes to price or details apply to future orders only. Existing
              orders retain the snapshot from when they were placed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[auto,1fr]">
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUpload
                previewUrl={previewUrl}
                onFileSelect={(file) => {
                  setPendingImage(file)
                  setClearExistingImage(false)
                }}
                onClear={() => {
                  setPendingImage(null)
                  setClearExistingImage(true)
                }}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} {...register('description')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-600">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dailyCap">Daily cap (optional)</Label>
                  <Input
                    id="dailyCap"
                    type="number"
                    min="1"
                    placeholder="No limit"
                    {...register('dailyCap', {
                      setValueAs: (v) => (v === '' ? undefined : Number(v)),
                    })}
                  />
                  {errors.dailyCap && (
                    <p className="text-xs text-red-600">
                      {errors.dailyCap.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/menus')}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={(!isDirty && !hasImageChange) || isBusy}
            >
              {isBusy ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
