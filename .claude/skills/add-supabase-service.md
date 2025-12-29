# Supabase Servis Fonksiyonu Ekleme Rehberi

Bu skill, KafkasDer Panel projesine yeni Supabase servis fonksiyonları eklerken izlenecek adımları açıklar.

## Servis Dosyası Yapısı

Tüm Supabase işlemleri `src/lib/supabase-service.ts` dosyasında merkezi olarak yönetilir.

### Dosya Organizasyonu

```typescript
// ============================================
// [FEATURE NAME] (Örn: MEMBERS, EVENTS, etc.)
// ============================================

// Fetch fonksiyonları
export async function fetch[Entity]() { }
export async function fetch[Entity]ById(id: string) { }

// Create fonksiyonları
export async function create[Entity](data: [EntityType]) { }

// Update fonksiyonları
export async function update[Entity](id: string, data: Partial<[EntityType]>) { }

// Delete fonksiyonları
export async function delete[Entity](id: string) { }

// Özel fonksiyonlar
export async function [customOperation]() { }
```

## CRUD Template

### 1. Fetch (Listele)

```typescript
/**
 * [Entity] listesini getirir
 *
 * @returns [Entity] dizisi
 * @throws Error if fetch fails
 */
export async function fetch[Entities](): Promise<[EntityType][]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Entity] fetch error:', error)
    throw new Error(`[Entity] listesi alınamadı: ${error.message}`)
  }

  return data || []
}
```

### 2. Fetch by ID (Tekil Getir)

```typescript
/**
 * ID'ye göre [entity] getirir
 *
 * @param id - [Entity] ID
 * @returns [Entity] objesi veya null
 */
export async function fetch[Entity]ById(id: string): Promise<[EntityType] | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`[Entity] fetch error (ID: ${id}):`, error)
    return null
  }

  return data
}
```

### 3. Create (Oluştur)

```typescript
/**
 * Yeni [entity] oluşturur
 *
 * @param data - [Entity] verileri
 * @returns Oluşturulan [entity]
 * @throws Error if creation fails
 */
export async function create[Entity](
  data: Omit<[EntityType], 'id' | 'created_at' | 'updated_at'>
): Promise<[EntityType]> {
  const supabase = await createClient()

  const { data: newEntity, error } = await supabase
    .from('[table_name]')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('[Entity] creation error:', error)
    throw new Error(`[Entity] oluşturulamadı: ${error.message}`)
  }

  return newEntity
}
```

### 4. Update (Güncelle)

```typescript
/**
 * [Entity] günceller
 *
 * @param id - [Entity] ID
 * @param data - Güncellenecek veriler
 * @returns Güncellenen [entity]
 * @throws Error if update fails
 */
export async function update[Entity](
  id: string,
  data: Partial<Omit<[EntityType], 'id' | 'created_at' | 'updated_at'>>
): Promise<[EntityType]> {
  const supabase = await createClient()

  const { data: updatedEntity, error } = await supabase
    .from('[table_name]')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`[Entity] update error (ID: ${id}):`, error)
    throw new Error(`[Entity] güncellenemedi: ${error.message}`)
  }

  return updatedEntity
}
```

### 5. Delete (Sil)

```typescript
/**
 * [Entity] siler
 *
 * @param id - [Entity] ID
 * @throws Error if deletion fails
 */
export async function delete[Entity](id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('[table_name]')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`[Entity] deletion error (ID: ${id}):`, error)
    throw new Error(`[Entity] silinemedi: ${error.message}`)
  }
}
```

## İlişkili Veriler (Relations)

### Join ile Veri Getirme

```typescript
/**
 * İlişkili verilerle [entity] listesini getirir
 */
export async function fetch[Entities]WithRelations(): Promise<[EntityType][]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('[table_name]')
    .select(`
      *,
      related_table:related_table_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Entity] with relations fetch error:', error)
    throw new Error(`İlişkili [entity] listesi alınamadı: ${error.message}`)
  }

  return data || []
}
```

## Filtreleme ve Arama

### Basit Filtreleme

```typescript
/**
 * Filtrelenmiş [entity] listesi getirir
 *
 * @param filters - Filtre kriterleri
 */
export async function fetch[Entities]Filtered(filters: {
  status?: string
  category?: string
  searchTerm?: string
}): Promise<[EntityType][]> {
  const supabase = await createClient()

  let query = supabase
    .from('[table_name]')
    .select('*')

  // Status filter
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  // Category filter
  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  // Search filter
  if (filters.searchTerm) {
    query = query.ilike('name', `%${filters.searchTerm}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Filtered [entity] fetch error:', error)
    throw new Error(`Filtrelenmiş [entity] listesi alınamadı: ${error.message}`)
  }

  return data || []
}
```

## Sayfalama (Pagination)

```typescript
/**
 * Sayfalı [entity] listesi getirir
 *
 * @param page - Sayfa numarası (0'dan başlar)
 * @param pageSize - Sayfa başına öğe sayısı
 */
export async function fetch[Entities]Paginated(
  page: number = 0,
  pageSize: number = 10
): Promise<{
  data: [EntityType][]
  totalCount: number
  hasMore: boolean
}> {
  const supabase = await createClient()

  const start = page * pageSize
  const end = start + pageSize - 1

  // Total count
  const { count } = await supabase
    .from('[table_name]')
    .select('*', { count: 'exact', head: true })

  // Paginated data
  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .order('created_at', { ascending: false })
    .range(start, end)

  if (error) {
    console.error('Paginated [entity] fetch error:', error)
    throw new Error(`Sayfalı [entity] listesi alınamadı: ${error.message}`)
  }

  return {
    data: data || [],
    totalCount: count || 0,
    hasMore: (count || 0) > end + 1,
  }
}
```

## Batch İşlemler

### Toplu Ekleme

```typescript
/**
 * Toplu [entity] oluşturur
 *
 * @param items - [Entity] dizisi
 * @returns Oluşturulan [entity]'ler
 */
export async function bulkCreate[Entities](
  items: Omit<[EntityType], 'id' | 'created_at' | 'updated_at'>[]
): Promise<[EntityType][]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('[table_name]')
    .insert(items)
    .select()

  if (error) {
    console.error('Bulk [entity] creation error:', error)
    throw new Error(`Toplu [entity] oluşturulamadı: ${error.message}`)
  }

  return data || []
}
```

### Toplu Güncelleme

```typescript
/**
 * Birden fazla [entity]'yi günceller
 *
 * @param updates - ID ve veri eşlemeleri
 */
export async function bulkUpdate[Entities](
  updates: Array<{ id: string; data: Partial<[EntityType]> }>
): Promise<[EntityType][]> {
  const supabase = await createClient()
  const results: [EntityType][] = []

  // Supabase doesn't support bulk updates directly
  // Execute updates sequentially
  for (const update of updates) {
    try {
      const updated = await update[Entity](update.id, update.data)
      results.push(updated)
    } catch (error) {
      console.error(`Failed to update [entity] ${update.id}:`, error)
    }
  }

  return results
}
```

## Storage İşlemleri

### Dosya Yükleme

```typescript
/**
 * Dosya yükler ve URL döner
 *
 * @param file - Yüklenecek dosya
 * @param bucket - Storage bucket adı
 * @param path - Dosya yolu
 */
export async function uploadFile(
  file: File,
  bucket: string = 'public-files',
  path?: string
): Promise<string> {
  const supabase = await createClient()

  const fileName = path || `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('File upload error:', error)
    throw new Error(`Dosya yüklenemedi: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
```

### Dosya Silme

```typescript
/**
 * Dosya siler
 *
 * @param path - Dosya yolu
 * @param bucket - Storage bucket adı
 */
export async function deleteFile(
  path: string,
  bucket: string = 'public-files'
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('File deletion error:', error)
    throw new Error(`Dosya silinemedi: ${error.message}`)
  }
}
```

## RPC (Stored Procedures)

```typescript
/**
 * Supabase RPC fonksiyonu çağırır
 *
 * @param params - RPC parametreleri
 */
export async function call[RPCFunction](params: {
  param1: string
  param2: number
}): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('[rpc_function_name]', params)

  if (error) {
    console.error('RPC call error:', error)
    throw new Error(`RPC çağrısı başarısız: ${error.message}`)
  }

  return data
}
```

## Error Handling Best Practices

```typescript
import { errorLogger } from '@/lib/error-logger'

export async function fetch[Entity]() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('[table_name]')
      .select('*')

    if (error) {
      // Log the error
      errorLogger.logError(error, {
        source: 'fetch[Entity]',
        table: '[table_name]',
      })

      throw new Error(`[Entity] listesi alınamadı: ${error.message}`)
    }

    return data || []
  } catch (error) {
    // Re-throw or handle gracefully
    if (error instanceof Error) {
      errorLogger.logError(error, { source: 'fetch[Entity]' })
    }
    throw error
  }
}
```

## Type Definitions

Servis fonksiyonları için type'ları `src/types/` dizininde tanımlayın:

```typescript
// src/types/[entity].ts

export interface [Entity] {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export type [Entity]CreateInput = Omit<[Entity], 'id' | 'created_at' | 'updated_at'>
export type [Entity]UpdateInput = Partial<[Entity]CreateInput>
```

## Checklist

Yeni servis fonksiyonu eklerken:

- [ ] Type definitions mevcut
- [ ] JSDoc yorumları eklenmiş (Türkçe)
- [ ] Error handling yapılmış
- [ ] Console.error log'ları eklenmiş
- [ ] Throw Error mesajları Türkçe
- [ ] createClient() doğru kullanılmış
- [ ] Select, insert, update, delete query'leri doğru
- [ ] Fonksiyon export edilmiş
- [ ] Bölüm başlığı eklenmişOrderleme eklenmişFiltre mantığı doğru

## Örnek: Tam CRUD İmplementasyonu

```typescript
// ============================================
// PRODUCTS
// ============================================

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category_id: string
  created_at: string
  updated_at: string
}

type ProductCreateInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>
type ProductUpdateInput = Partial<ProductCreateInput>

export async function fetchProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Products fetch error:', error)
    throw new Error(`Ürün listesi alınamadı: ${error.message}`)
  }

  return data || []
}

export async function createProduct(data: ProductCreateInput): Promise<Product> {
  const supabase = await createClient()

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Product creation error:', error)
    throw new Error(`Ürün oluşturulamadı: ${error.message}`)
  }

  return newProduct
}

export async function updateProduct(
  id: string,
  data: ProductUpdateInput
): Promise<Product> {
  const supabase = await createClient()

  const { data: updated, error } = await supabase
    .from('products')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`Product update error (ID: ${id}):`, error)
    throw new Error(`Ürün güncellenemedi: ${error.message}`)
  }

  return updated
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`Product deletion error (ID: ${id}):`, error)
    throw new Error(`Ürün silinemedi: ${error.message}`)
  }
}
```

## Kaynaklar

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
