import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
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
import type { Admin, AdminFormData } from '@/types/admin.types'

const createSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    role: z.enum(['super_admin', 'admin']),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm the password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(['super_admin', 'admin']),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>
type FormValues = CreateFormValues | EditFormValues

interface AdminSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin?: Admin | null
  onSubmit: (values: AdminFormData) => void
  loading?: boolean
}

export default function AdminSheet({
  open,
  onOpenChange,
  admin,
  onSubmit,
  loading,
}: AdminSheetProps) {
  const isEdit = !!admin
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: { name: '', email: '', role: 'admin', password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (open && admin) {
      reset({ name: admin.name, email: admin.email, role: admin.role, password: '', confirmPassword: '' })
    } else if (open) {
      reset({ name: '', email: '', role: 'admin', password: '', confirmPassword: '' })
    }
    setShowPassword(false)
    setShowConfirm(false)
  }, [open, admin, reset])

  function handleFormSubmit(values: FormValues) {
    onSubmit({
      name: values.name,
      email: values.email,
      role: values.role,
      password: values.password || undefined,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Admin' : 'Add Admin'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update admin details.' : 'Add a new admin user to the platform.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-4 py-4">
            <div>
              <Label htmlFor="admin-name">Full Name *</Label>
              <Input id="admin-name" {...register('name')} className="mt-1.5" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="admin-email">Email *</Label>
              <Input id="admin-email" type="email" {...register('email')} className="mt-1.5" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Role *</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <Label htmlFor="admin-password">
                {isEdit ? 'New Password' : 'Password *'}
              </Label>
              {isEdit && (
                <p className="mb-1.5 text-xs text-gray-500">Leave blank to keep the current password</p>
              )}
              <div className="relative mt-1.5">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <Label htmlFor="admin-confirm">Confirm Password {!isEdit && '*'}</Label>
              <div className="relative mt-1.5">
                <Input
                  id="admin-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
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
