import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import type { Admin, AdminFormData } from '@/types/admin.types'

const createSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm the password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const editSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: { fullName: '', phone: '', email: '' },
  })

  useEffect(() => {
    if (open && admin) {
      reset({ fullName: admin.fullName, phone: admin.phone, email: admin.email ?? '' })
    } else if (open) {
      reset({ fullName: '', phone: '', email: '' })
    }
    setShowPassword(false)
    setShowConfirm(false)
  }, [open, admin, reset])

  function handleFormSubmit(values: FormValues) {
    onSubmit({
      fullName: values.fullName,
      phone: values.phone,
      email: values.email || undefined,
      password: 'password' in values ? values.password : undefined,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Admin' : 'Add Admin'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update admin details.' : 'Add a peer admin on your catering.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-4 py-4">
            <div>
              <Label htmlFor="admin-name">Full Name *</Label>
              <Input id="admin-name" {...register('fullName')} className="mt-1.5" />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="admin-phone">Phone *</Label>
              <Input
                id="admin-phone"
                type="tel"
                placeholder="+998901234567"
                {...register('phone')}
                className="mt-1.5"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" {...register('email')} className="mt-1.5" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {!isEdit && (
              <>
                <div className="border-t pt-4">
                  <Label htmlFor="admin-password">Password *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password' as 'password')}
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
                  {'password' in errors && errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="admin-confirm">Confirm Password *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="admin-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      {...register('confirmPassword' as 'confirmPassword')}
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
                  {'confirmPassword' in errors && errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}
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
