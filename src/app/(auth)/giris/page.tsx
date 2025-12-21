'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { useUserStore } from '@/stores/user-store'

export default function LoginPage() {
    const router = useRouter()
    const { login, isLoading } = useUserStore()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false
        }
    })

    async function onSubmit(data: LoginFormData) {
        // Trim email and password before submission
        const trimmedEmail = (data.email || '').trim()
        const trimmedPassword = (data.password || '').trim()
        
        // Validate manually if needed
        if (!trimmedEmail || trimmedEmail.length === 0) {
            form.setError('email', { message: 'E-posta adresi gereklidir' })
            return
        }
        
        if (!trimmedPassword || trimmedPassword.length < 6) {
            form.setError('password', { message: 'Şifre en az 6 karakter olmalıdır' })
            return
        }
        
        const success = await login(trimmedEmail, trimmedPassword)

        if (success) {
            // Wait longer for cookie to be set and persisted
            await new Promise(resolve => setTimeout(resolve, 300))
            
            // Double-check cookie is set
            if (typeof document !== 'undefined') {
                const cookies = document.cookie.split(';')
                const hasAuthToken = cookies.some(cookie => cookie.trim().startsWith('auth-token='))
                
                if (!hasAuthToken) {
                    // Retry setting cookie
                    const cookieValue = `mock-token-${Date.now()}`
                    const expires = new Date()
                    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000)
                    document.cookie = `auth-token=${cookieValue}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
            }
            
            toast.success('Giriş başarılı', {
                description: 'Yönetim paneline yönlendiriliyorsunuz...'
            })
            
            // Use window.location for full page reload to ensure cookie is read by middleware
            setTimeout(() => {
                window.location.href = '/genel'
            }, 500)
        } else {
            toast.error('Giriş başarısız', {
                description: 'E-posta veya şifre hatalı.'
            })
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-3xl">K</span>
                    </div>
                </div>

                <CardTitle className="text-2xl font-bold">Hoş Geldiniz</CardTitle>
                <CardDescription>
                    Dernek yönetim panelinize giriş yapın
                </CardDescription>
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
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
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
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                        Beni hatırla
                                    </FormLabel>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                'Giriş Yap'
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="mt-4 text-center">
                    <Button variant="link" className="text-sm text-muted-foreground">
                        Şifrenizi mi unuttunuz?
                    </Button>
                </div>

                {/* Demo credentials hint */}
                <div className="mt-6 p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">
                        Demo: Herhangi bir e-posta ve 6+ karakterli şifre ile giriş yapabilirsiniz
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
