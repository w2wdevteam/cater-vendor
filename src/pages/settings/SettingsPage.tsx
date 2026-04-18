import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function SettingsPage() {
  useEffect(() => {
    document.title = 'Settings — Catering Admin'
  }, [])

  const [showFields, setShowFields] = useState<Record<string, boolean>>({})

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Password updated successfully.')
      reset()
    },
    onError: () => {
      setError('currentPassword', { message: 'Current password is incorrect.' })
    },
  })

  function onSubmit(values: FormValues) {
    mutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  function toggleShow(field: string) {
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const fields = [
    { name: 'currentPassword' as const, label: 'Current Password' },
    { name: 'newPassword' as const, label: 'New Password' },
    { name: 'confirmPassword' as const, label: 'Confirm New Password' },
  ]

  return (
    <>
      <PageHeader title="Account Settings" />

      <div className="max-w-md rounded-lg border bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
        <p className="mt-1 text-sm text-gray-500">Update your account password.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {fields.map(({ name, label }) => (
            <div key={name}>
              <Label htmlFor={name}>{label}</Label>
              <div className="relative mt-1.5">
                <Input
                  id={name}
                  type={showFields[name] ? 'text' : 'password'}
                  {...register(name)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(name)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showFields[name] ? 'Hide password' : 'Show password'}
                >
                  {showFields[name] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors[name] && (
                <p className="mt-1 text-xs text-red-500">{errors[name]?.message}</p>
              )}
            </div>
          ))}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </>
  )
}
