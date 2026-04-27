import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { router } from '@/router'
import { useAuthStore } from '@/store/auth.store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
})

export default function App() {
  const bootstrapping = useAuthStore((s) => s.bootstrapping)
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <QueryClientProvider client={queryClient}>
      {bootstrapping ? (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <RouterProvider router={router} />
      )}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}
