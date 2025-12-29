# React Component Ekleme Rehberi

Bu skill, KafkasDer Panel projesine yeni React komponenti eklerken izlenecek adımları açıklar.

## Komponent Tipleri

### 1. UI Komponenti (shadcn/ui)
**Konum**: `src/components/ui/`

shadcn/ui bileşenleri eklemek için:
```bash
npx shadcn@latest add [component-name]
```

Örnek:
```bash
npx shadcn@latest add table
npx shadcn@latest add calendar
```

### 2. Shared Component (Paylaşılan)
**Konum**: `src/components/shared/`

Birden fazla özellik tarafından kullanılan bileşenler:
- `error-boundary.tsx` - Hata yakalama
- `loading-spinner.tsx` - Yükleme göstergesi
- `page-header.tsx` - Sayfa başlığı

### 3. Feature Component (Özellik Bazlı)
**Konum**: `src/components/[feature-name]/`

Belirli bir özelliğe ait bileşenler:
- `src/components/uyeler/` - Üye yönetimi bileşenleri
- `src/components/etkinlikler/` - Etkinlik bileşenleri
- `src/components/finans/` - Finans bileşenleri

## Component Template

### Client Component (İnteraktif)

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface [ComponentName]Props {
  // Props tanımları
  title?: string
  onAction?: () => void
}

/**
 * [ComponentName] Bileşeni
 *
 * @description Bileşenin ne yaptığını açıklayan Türkçe açıklama
 * @example
 * ```tsx
 * <ComponentName title="Başlık" onAction={handleAction} />
 * ```
 */
export function [ComponentName]({
  title,
  onAction
}: [ComponentName]Props) {
  const [state, setState] = useState<string>('')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Açıklama</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Bileşen içeriği */}
      </CardContent>
    </Card>
  )
}
```

### Server Component (Varsayılan)

```typescript
import { createClient } from '@/lib/supabase/server'

interface [ComponentName]Props {
  id: string
}

/**
 * [ComponentName] Bileşeni
 *
 * @description Server-side veri çeken bileşen
 */
export async function [ComponentName]({ id }: [ComponentName]Props) {
  const supabase = await createClient()

  // Veri çekme
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return <div>Hata: {error.message}</div>
  }

  return (
    <div>
      {/* Bileşen içeriği */}
    </div>
  )
}
```

## Best Practices

### 1. Type Safety
✅ **Doğru**:
```typescript
interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
  }
  onUpdate: (userId: string) => void
}
```

❌ **Yanlış**:
```typescript
function UserCard({ user, onUpdate }: any) {
  // any kullanmayın!
}
```

### 2. Props Destructuring
✅ **Doğru**:
```typescript
export function Card({ title, children }: CardProps) {
  return <div>{title}</div>
}
```

❌ **Yanlış**:
```typescript
export function Card(props: CardProps) {
  return <div>{props.title}</div>
}
```

### 3. Conditional Rendering
✅ **Doğru**:
```typescript
{isLoading ? (
  <LoadingSpinner />
) : (
  <DataTable data={data} />
)}
```

### 4. Event Handlers
✅ **Doğru**:
```typescript
const handleClick = () => {
  // İşlem
}

<Button onClick={handleClick}>Tıkla</Button>
```

❌ **Yanlış**:
```typescript
<Button onClick={() => {
  // Çok fazla kod buraya yazılmamalı
  // Ayrı bir fonksiyon kullanın
}}>
  Tıkla
</Button>
```

### 5. Component Composition
✅ **Doğru**:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Başlık</CardTitle>
    <CardDescription>Açıklama</CardDescription>
  </CardHeader>
  <CardContent>
    İçerik
  </CardContent>
</Card>
```

## Styling

### Tailwind Classes
- Mobile-first responsive: `text-sm md:text-base lg:text-lg`
- Dark mode: `bg-white dark:bg-gray-900`
- Hover states: `hover:bg-gray-100`
- Focus states: `focus:ring-2 focus:ring-blue-500`

### Class Merging (cn utility)
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)}>
```

## Form Components

### React Hook Form + Zod
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  email: z.string().email('Geçerli email giriniz'),
})

type FormData = z.infer<typeof formSchema>

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

## Data Fetching

### TanStack Query (Client Component)
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchMembers } from '@/lib/supabase-service'

export function MemberList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Hata: {error.message}</div>

  return (
    <div>
      {data?.map(member => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  )
}
```

### Server Component (Direct Fetch)
```typescript
import { fetchMembers } from '@/lib/supabase-service'

export async function MemberList() {
  const members = await fetchMembers()

  return (
    <div>
      {members.map(member => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  )
}
```

## Error Handling

```typescript
import { ErrorBoundary } from '@/components/shared/error-boundary'

export function ParentComponent() {
  return (
    <ErrorBoundary>
      <ChildComponent />
    </ErrorBoundary>
  )
}
```

## Testing

### Component Test Template
```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)

    const button = screen.getByRole('button')
    await button.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Checklist

Yeni komponent eklerken kontrol edin:

- [ ] TypeScript interface/type tanımları mevcut
- [ ] JSDoc yorumları eklenmiş (Türkçe)
- [ ] Props destructuring kullanılmış
- [ ] Responsive design uygulanmış
- [ ] Dark mode desteği var
- [ ] Error handling yapılmış
- [ ] Loading states var
- [ ] Accessibility özellikleri eklenmiş (aria-label, etc.)
- [ ] Import sırası doğru
- [ ] Tailwind classes düzenli
- [ ] Test yazılmış (gerekirse)

## Örnekler

Mevcut iyi örnekler:
- `src/components/shared/error-boundary.tsx` - Error handling
- `src/components/ui/button.tsx` - UI component
- `src/components/ui/card.tsx` - Composition example

## Kaynaklar

- [React Best Practices](https://react.dev/learn)
- [Next.js Component Patterns](https://nextjs.org/docs/app/building-your-application/rendering)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
