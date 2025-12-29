/**
 * Zod Validation Schemas
 * Defines validation schemas for all input types across the application
 */

import { z } from 'zod'

/**
 * Common validation patterns
 */
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+\s\-()]+$/,
  iban: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  url: /^https?:\/\/.+/,
  turkishId: /^[0-9]{11}$/,
}

/**
 * Base schemas
 */
export const emailSchema = z
  .string()
  .min(1, 'E-mail adresi zorunludur')
  .email('Geçerli bir e-mail adresi girin')
  .max(255, 'E-mail adresi 255 karakteri geçemez')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .max(255, 'Şifre 255 karakteri geçemez')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Şifre büyük harf, küçük harf, rakam ve özel karakter içermelidir'
  )

export const phoneSchema = z
  .string()
  .min(10, 'Telefon numarası en az 10 karakter olmalıdır')
  .max(20, 'Telefon numarası 20 karakteri geçemez')
  .regex(PATTERNS.phone, 'Geçerli bir telefon numarası girin')

export const nameSchema = z
  .string()
  .min(2, 'Ad en az 2 karakter olmalıdır')
  .max(100, 'Ad 100 karakteri geçemez')
  .trim()
  .refine((val) => !val.includes('<') && !val.includes('>'), {
    message: 'Ad HTML karakterleri içeremez',
  })

export const urlSchema = z
  .string()
  .url('Geçerli bir URL girin')
  .max(2048, 'URL 2048 karakteri geçemez')
  .optional()
  .or(z.literal(''))

export const idSchema = z
  .string()
  .uuid('Geçerli bir ID girin')

export const textSchema = z
  .string()
  .max(10000, 'Metin 10000 karakteri geçemez')
  .trim()

export const dateSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), 'Geçerli bir tarih girin')
  .transform((val) => new Date(val))

/**
 * Member (Üye) Schemas
 */
export const memberCreateSchema = z.object({
  ad: nameSchema,
  soyad: nameSchema,
  email: emailSchema,
  telefon: phoneSchema,
  uyeTuru: z.enum(['aktif', 'onursal', 'genc', 'destekci']),
  cinsiyet: z.enum(['erkek', 'kadin']).optional(),
  kanGrubu: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-']).optional(),
  il: z.string().max(50).optional(),
  ilce: z.string().max(50).optional(),
  adres: z.string().max(500).optional(),
  tcNo: z
    .string()
    .regex(PATTERNS.turkishId, 'Geçerli bir TC Kimlik Numarası girin')
    .optional(),
  dogumTarihi: dateSchema.optional(),
  meslegi: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
})

export const memberUpdateSchema = memberCreateSchema.partial()

export const memberDeleteSchema = z.object({
  ids: z.array(z.string().uuid()),
})

export const memberBulkStatusSchema = z.object({
  ids: z.array(z.string().uuid()),
  status: z.enum(['guncel', 'gecmis', 'muaf']),
})

export type MemberCreate = z.infer<typeof memberCreateSchema>
export type MemberUpdate = z.infer<typeof memberUpdateSchema>

/**
 * Donation (Bağış) Schemas
 */
export const donationCreateSchema = z.object({
  memberId: idSchema.optional(),
  ad: nameSchema.optional(),
  soyad: nameSchema.optional(),
  email: emailSchema.optional(),
  telefon: phoneSchema.optional(),
  amount: z
    .number()
    .positive('Bağış miktarı sıfırdan büyük olmalıdır')
    .max(1000000000, 'Bağış miktarı çok yüksek'),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  donationType: z.enum(['nakit', 'banka', 'kredi-karti', 'diger']),
  donationDate: dateSchema.optional().default(() => new Date()),
  description: textSchema.optional(),
  isAnonymous: z.boolean().default(false),
  receiptNeeded: z.boolean().default(false),
})

export const donationUpdateSchema = donationCreateSchema.partial()

export type DonationCreate = z.infer<typeof donationCreateSchema>
export type DonationUpdate = z.infer<typeof donationUpdateSchema>

/**
 * Beneficiary (Yardım Alan) Schemas
 */
export const beneficiaryCreateSchema = z.object({
  ad: nameSchema,
  soyad: nameSchema,
  email: emailSchema.optional().or(z.literal('')),
  telefon: phoneSchema,
  yakinlik: z.string().max(100),
  adres: z.string().max(500),
  il: z.string().max(50),
  ilce: z.string().max(50),
  yardimTuru: z.enum(['aylik', 'gunluk', 'saglik', 'diger']),
  yardimMiktari: z
    .number()
    .positive()
    .max(1000000),
  baslamaTarihi: dateSchema,
  bitişTarihi: dateSchema.optional(),
  durum: z.enum(['aktif', 'pasif', 'tamamlandi']).default('aktif'),
  notlar: textSchema.optional(),
})

export const beneficiaryUpdateSchema = beneficiaryCreateSchema.partial()

export type BeneficiaryCreate = z.infer<typeof beneficiaryCreateSchema>
export type BeneficiaryUpdate = z.infer<typeof beneficiaryUpdateSchema>

/**
 * Payment (Ödeme) Schemas
 */
export const paymentCreateSchema = z.object({
  beneficiaryId: idSchema,
  amount: z.number().positive(),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  paymentDate: dateSchema,
  paymentMethod: z.enum(['nakit', 'banka', 'kredi-karti', 'diger']),
  reference: z.string().max(100).optional(),
  description: textSchema.optional(),
  receiptNeeded: z.boolean().default(false),
})

export const paymentUpdateSchema = paymentCreateSchema.partial()

export type PaymentCreate = z.infer<typeof paymentCreateSchema>
export type PaymentUpdate = z.infer<typeof paymentUpdateSchema>

/**
 * Authentication Schemas
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre zorunludur'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z.object({
  ad: nameSchema,
  soyad: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

export const resetPasswordSchema = z.object({
  email: emailSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre zorunludur'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Yeni şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

export type Login = z.infer<typeof loginSchema>
export type Register = z.infer<typeof registerSchema>

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
})

export type Pagination = z.infer<typeof paginationSchema>

/**
 * Filter Schema
 */
export const filterSchema = z.object({
  search: z.string().max(100).optional(),
  status: z.array(z.string()).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
})

export type Filter = z.infer<typeof filterSchema>

/**
 * File Upload Schema
 */
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'Dosya boyutu 10MB\'ı geçemez',
    })
    .refine(
      (file) => [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.type),
      {
        message: 'Desteklenmeyen dosya türü',
      }
    ),
})

export type FileUpload = z.infer<typeof fileUploadSchema>

/**
 * Helper function to validate data
 */
export async function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{
  isValid: boolean
  data?: T
  errors?: Record<string, string>
}> {
  try {
    const validData = await schema.parseAsync(data)
    return { isValid: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { isValid: false, errors }
    }
    return { isValid: false }
  }
}

/**
 * Safe parse helper
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean
  data?: T
  error?: z.ZodError
} {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}
