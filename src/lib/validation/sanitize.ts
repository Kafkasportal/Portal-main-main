/**
 * Input Sanitization Utilities
 * Provides functions to sanitize user input and prevent XSS attacks
 */

/**
 * Sanitizes HTML content by removing dangerous tags and attributes
 * Allows basic formatting tags (b, i, u, br, p, etc.)
 */
export function sanitizeHTML(html: string, allowedTags?: string[]): string {
  if (!html) return ''

  // Default allowed tags
  const defaultAllowedTags = [
    'b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div'
  ]

  const tags = allowedTags || defaultAllowedTags

  // Create temporary element
  const temp = document.createElement('div')
  temp.innerHTML = html

  // Remove dangerous tags and attributes
  removeDangerousTags(temp, tags)
  removeUnsafeAttributes(temp)

  return temp.innerHTML
}

/**
 * Recursively removes tags not in the allowed list
 */
function removeDangerousTags(node: Element, allowedTags: string[]): void {
  const children = Array.from(node.childNodes)

  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element
      const tagName = element.tagName.toLowerCase()

      if (!allowedTags.includes(tagName)) {
        // Replace with text content
        const text = document.createTextNode(element.textContent || '')
        element.replaceWith(text)
      } else {
        // Recursively check children
        removeDangerousTags(element, allowedTags)
      }
    }
  }
}

/**
 * Removes unsafe attributes from elements
 */
function removeUnsafeAttributes(node: Element): void {
  const allowedAttributes = [
    'href', 'title', 'target', 'rel', 'class', 'id', 'style'
  ]

  const dangerous = ['on', 'script', 'data:', 'javascript:']

  const children = Array.from(node.childNodes)

  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element

      // Remove dangerous attributes
      Array.from(element.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase()
        const value = attr.value.toLowerCase()

        // Check if attribute is dangerous
        const isDangerous = dangerous.some((d) => 
          name.startsWith(d) || value.includes(d)
        )

        if (isDangerous || !allowedAttributes.includes(name)) {
          element.removeAttribute(attr.name)
        }
      })

      // Recursively check children
      removeUnsafeAttributes(element)
    }
  }
}

/**
 * Escapes HTML special characters
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }

  return text.replace(/[&<>"']/g, (char) => map[char] || char)
}

/**
 * Removes all HTML tags
 */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Sanitizes user input for database storage
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  // Trim whitespace
  let sanitized = input.trim()

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Limit length to prevent DoS
  const MAX_INPUT_LENGTH = 10000
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_INPUT_LENGTH)
  }

  return sanitized
}

/**
 * Sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  return sanitizeInput(email).toLowerCase().trim()
}

/**
 * Sanitizes phone numbers (remove invalid characters)
 */
export function sanitizePhoneNumber(phone: string): string {
  // Keep only digits and +
  return phone.replace(/[^\d+]/g, '')
}

/**
 * Sanitizes URL to prevent javascript: attacks
 */
export function sanitizeURL(url: string): string {
  if (!url) return ''

  const cleaned = sanitizeInput(url)

  try {
    const urlObj = new URL(cleaned)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return ''
    }
    return urlObj.toString()
  } catch {
    // If URL parsing fails, check for common attack patterns
    const lowerUrl = cleaned.toLowerCase()
    if (lowerUrl.includes('javascript:') || 
        lowerUrl.includes('data:') ||
        lowerUrl.includes('vbscript:')) {
      return ''
    }
    return cleaned
  }
}

/**
 * Sanitizes file names to prevent directory traversal
 */
export function sanitizeFileName(filename: string): string {
  if (!filename) return 'file'

  // Remove path separators
  let sanitized = filename.replace(/[\/\\]/g, '')

  // Remove leading dots and multiple consecutive dots (path traversal protection)
  sanitized = sanitized.replace(/^\.\.*/g, '')
  sanitized = sanitized.replace(/\.+/g, '.')

  // Remove any remaining dots at the end or beginning
  sanitized = sanitized.replace(/^\.\.|\.+$/g, '')

  // Allow only alphanumeric, dots, hyphens, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Check for path traversal attempts
  if (sanitized.includes('..')) {
    throw new Error('Invalid filename: path traversal detected')
  }

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255)
  }

  return sanitized || 'file'
}

/**
 * Sanitizes JSON data recursively
 */
export function sanitizeJSON(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeJSON(item))
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeInput(key)
      sanitized[sanitizedKey] = sanitizeJSON(value)
    }

    return sanitized
  }

  return obj
}

/**
 * Validates file type for upload security
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'Dosya seçilmedi' }
  }

  const mimeType = file.type

  // Check if MIME type is allowed
  if (!allowedTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `Desteklenmeyen dosya türü: ${mimeType}`,
    }
  }

  // Additional validation: check file extension matches MIME type
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  const extensionMap: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  }

  const expectedExtensions = extensionMap[mimeType] || []
  if (!expectedExtensions.includes(fileExtension || '')) {
    return {
      isValid: false,
      error: 'Dosya uzantısı ile MIME tipi eşleşmiyor',
    }
  }

  return { isValid: true }
}

/**
 * Maximum file size constants (in bytes)
 */
export const MAX_FILE_SIZES = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  PDF: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  DEFAULT: 5 * 1024 * 1024, // 5MB
} as const

/**
 * Validates file size based on type
 */
export function validateFileSize(
  file: File,
  maxSize: number = MAX_FILE_SIZES.DEFAULT
): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'Dosya seçilmedi' }
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    return {
      isValid: false,
      error: `Dosya boyutu ${maxSizeMB}MB'den büyük olamaz`,
    }
  }

  return { isValid: true }
}

/**
 * Comprehensive file validation for uploads
 */
export function validateFileUpload(
  file: File,
  options?: {
    allowedTypes?: string[]
    maxSize?: number
  }
): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'Dosya seçilmedi' }
  }

  // Validate file type
  const typeValidation = validateFileType(file, options?.allowedTypes)
  if (!typeValidation.isValid) {
    return typeValidation
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, options?.maxSize)
  if (!sizeValidation.isValid) {
    return sizeValidation
  }

  return { isValid: true }
}

/**
 * Checks if input contains potential XSS patterns
 */
export function containsXSSPatterns(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /on\w+\s*=/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /src\s*=\s*['"]?(?:javascript|data):/gi,
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
}

/**
 * Validates input length
 */
export function validateInputLength(
  input: string,
  min: number = 0,
  max: number = 10000
): boolean {
  const length = input.trim().length
  return length >= min && length <= max
}

/**
 * Sanitizes and validates input in one call
 */
export function sanitizeAndValidate(
  input: string,
  options: {
    minLength?: number
    maxLength?: number
    required?: boolean
    type?: 'text' | 'email' | 'url' | 'phone' | 'filename'
    allowHTML?: boolean
  } = {}
): {
  isValid: boolean
  sanitized?: string
  error?: string
} {
  const {
    minLength = 0,
    maxLength = 10000,
    required = false,
    type = 'text',
    allowHTML = false,
  } = options

  // Check if required
  if (required && !input) {
    return { isValid: false, error: 'Bu alan zorunludur' }
  }

  // Sanitize based on type
  let sanitized = ''

  switch (type) {
    case 'email':
      sanitized = sanitizeEmail(input)
      break
    case 'url':
      sanitized = sanitizeURL(input)
      break
    case 'phone':
      sanitized = sanitizePhoneNumber(input)
      break
    case 'filename':
      sanitized = sanitizeFileName(input)
      break
    default:
      sanitized = sanitizeInput(input)
  }

  // Check length
  if (!validateInputLength(sanitized, minLength, maxLength)) {
    return {
      isValid: false,
      error: `Uzunluk ${minLength}-${maxLength} karakter arasında olmalıdır`,
    }
  }

  // Check for XSS patterns if HTML not allowed
  if (!allowHTML && containsXSSPatterns(sanitized)) {
    return {
      isValid: false,
      error: 'Girdi tehlikeli içerik içeriyor',
    }
  }

  // Sanitize HTML if allowed
  if (allowHTML) {
    sanitized = sanitizeHTML(sanitized)
  }

  return { isValid: true, sanitized }
}
