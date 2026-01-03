'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { useUserStore } from '@/stores/user-store'

// LoginPage components

export default function LoginPage() {
  const { login, isLoading, error } = useUserStore()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Better UX: validate on blur for immediate feedback
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const router = useRouter()
  async function onSubmit(data: LoginFormData) {
    const success = await login(data.email, data.password)

    if (success) {
      toast.success('Giriş başarılı')
      router.push('/genel')
    } else {
      toast.error(error || 'Giriş başarısız')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-2xl">
            <span className="text-primary-foreground text-3xl font-bold">
              K
            </span>
          </div>
        </div>

        <CardTitle className="text-2xl font-bold">Hoş Geldiniz</CardTitle>
        <CardDescription>Dernek yönetim panelinize giriş yapın</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="ornek@kafkasder.org veya demo"
                      autoComplete="email"
                      aria-label="E-posta adresi"
                      aria-describedby={
                        form.formState.errors.email
                          ? `${field.name}-error`
                          : undefined
                      }
                      aria-invalid={!!form.formState.errors.email}
                      {...field}
                      onBlur={(e) => {
                        const trimmed = e.target.value.trim()
                        field.onChange(trimmed)
                        field.onBlur()
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        aria-label="Şifre"
                        aria-describedby={
                          form.formState.errors.password
                            ? `${field.name}-error`
                            : undefined
                        }
                        aria-invalid={!!form.formState.errors.password}
                        {...field}
                        onChange={(e) => {
                          const trimmed = e.target.value.trim()
                          field.onChange(trimmed)
                        }}
                        onBlur={field.onBlur}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                        aria-label={
                          showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'
                        }
                        aria-pressed={showPassword}
                        onClick={() => {
                          setShowPassword(!showPassword)
                        }}
                      >
                        {showPassword ? (
                          <EyeOff className="text-muted-foreground h-4 w-4" />
                        ) : (
                          <Eye className="text-muted-foreground h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer text-sm font-normal">
                    Beni hatırla
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              aria-label="Giriş yap"
              disabled={isLoading}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <Button variant="link" className="text-muted-foreground text-sm">
            Şifrenizi mi unuttunuz?
          </Button>
        </div>

        {/* Demo credentials hint */}
        <div className="bg-muted/50 mt-6 rounded-lg p-3 text-center">
          <p className="text-muted-foreground text-xs">
            Demo Hesabı:{' '}
            <span className="font-semibold">admin_test@kafkasder.org</span> /
            Şifre: <span className="font-semibold">admin123456</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
