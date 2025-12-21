/// <reference types="node" />

declare namespace NodeJS {
    interface ProcessEnv {
        // Application
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly NEXT_PUBLIC_APP_NAME: string
        readonly NEXT_PUBLIC_APP_URL: string

        // API Configuration
        readonly NEXT_PUBLIC_API_URL: string
        readonly NEXT_PUBLIC_API_TIMEOUT: string

        // Mock Mode
        readonly NEXT_PUBLIC_USE_MOCK_API: 'true' | 'false'

        // Authentication
        readonly NEXT_PUBLIC_AUTH_COOKIE_NAME: string
        readonly NEXT_PUBLIC_AUTH_COOKIE_EXPIRES: string

        // Feature Flags
        readonly NEXT_PUBLIC_ENABLE_QR_SCANNER: 'true' | 'false'
        readonly NEXT_PUBLIC_ENABLE_EXCEL_EXPORT: 'true' | 'false'
        readonly NEXT_PUBLIC_ENABLE_DEVTOOLS: 'true' | 'false'

        // Builder.io
        readonly NEXT_PUBLIC_BUILDER_API_KEY?: string

        // Analytics (optional)
        readonly NEXT_PUBLIC_GA_ID?: string
        readonly NEXT_PUBLIC_SENTRY_DSN?: string
    }
}
