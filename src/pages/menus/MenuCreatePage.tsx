import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import ImageUpload from '@/components/common/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateMenuItem } from '@/hooks/useMenus'
import { DIETARY_TAGS, type DietaryTag } from '@/lib/constants'
import { cn } from '@/lib/utils'

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z
    .number({ message: 'Price is required' })
    .positive('Price must be greater than 0'),
  imageUrl: z.string().optional(),
  dietaryTags: z.array(z.string()),
  dailyCap: z
    .number()
    .int()
    .positive('Daily cap must be greater than 0')
    .optional(),
})

type FormValues = z.infer<typeof menuItemSchema>

export default function MenuCreatePage() {
  const navigate = useNavigate()
  const create = useCreateMenuItem()

  useEffect(() => {
    document.title = 'Create Menu Item — Catering Admin'
  }, [])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined as unknown as number,
      imageUrl: '',
      dietaryTags: [],
      dailyCap: undefined,
    },
  })

  const selectedTags = watch('dietaryTags') as DietaryTag[]

  function toggleTag(tag: DietaryTag) {
    const current = (watch('dietaryTags') as DietaryTag[]) || []
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag]
    setValue('dietaryTags', next, { shouldDirty: true })
  }

  function onSubmit(values: FormValues) {
    create.mutate(
      {
        name: values.name,
        description: values.description,
        price: values.price,
        imageUrl: values.imageUrl || undefined,
        dietaryTags: values.dietaryTags as DietaryTag[],
        dailyCap: values.dailyCap,
      },
      {
        onSuccess: () => {
          toast.success('Menu item created')
          navigate('/menus')
        },
        onError: () => toast.error('Failed to create menu item'),
      },
    )
  }

  return (
    <>
      <PageHeader
        title="Create Menu Item"
        subtitle="Add a new dish to your menu."
        action={
          <Button variant="outline" onClick={() => navigate('/menus')}>
            <ArrowLeft className="h-4 w-4" />
            Back to menus
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl space-y-6 rounded-lg border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-[auto,1fr]">
          <div className="space-y-2">
            <Label>Image</Label>
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <ImageUpload
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? '')}
                />
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder="e.g. Chicken Rice" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Short description shown to buyers"
                {...register('description')}
              />
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
                  placeholder="0.00"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-xs text-red-600">{errors.price.message}</p>
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

        <div className="space-y-2 border-t pt-6">
          <Label>Dietary Tags</Label>
          <p className="text-xs text-gray-500">
            Select all that apply to this menu item.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(DIETARY_TAGS).map(([key, label]) => {
              const selected = selectedTags.includes(key as DietaryTag)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleTag(key as DietaryTag)}
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    selected
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/menus')}
            disabled={create.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create menu item'}
          </Button>
        </div>
      </form>
    </>
  )
}
