'use client'

import Image from 'next/image'

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
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
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
    <Card className="border-muted/60 animate-in hover-glow w-full max-w-sm overflow-hidden bg-white/95 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-2 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative h-48 w-full transform transition-transform duration-300 hover:scale-105">
            <Image
              src="/kafkasder-logo.png"
              alt="KAFKASDER Logo"
              fill
              className="object-contain" // Use object-contain to ensure the wide logo fits well
              priority
            />
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-foreground text-2xl font-bold tracking-tight">
            Hoş Geldiniz
          </CardTitle>
          <CardDescription className="text-base">
            Dernek yönetim panelinize giriş yapın
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="stagger-item">
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="ornek@kafkasder.org veya demo"
                      autoComplete="email"
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
                <FormItem className="stagger-item">
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
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
                <FormItem className="stagger-item flex items-center space-x-2">
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

            <div className="stagger-item pt-2">
              <Button
                type="submit"
                className="btn-press hover:bg-primary/90 h-11 w-full text-base font-semibold shadow-md transition-all"
                loading={isLoading}
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            className="text-muted-foreground hover:text-primary text-sm transition-colors"
          >
            Şifrenizi mi unuttunuz?
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
