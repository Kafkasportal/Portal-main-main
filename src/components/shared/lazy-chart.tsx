'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Recharts componentlerini lazy load et
export const ResponsiveContainer = dynamic(
    () => import('recharts').then(mod => mod.ResponsiveContainer),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
            </div>
        )
    }
)

export const PieChart = dynamic(
    () => import('recharts').then(mod => mod.PieChart),
    { ssr: false }
)

export const Pie = dynamic(
    () => import('recharts').then(mod => mod.Pie),
    { ssr: false }
)

export const Cell = dynamic(
    () => import('recharts').then(mod => mod.Cell),
    { ssr: false }
)

export const Tooltip = dynamic(
    () => import('recharts').then(mod => mod.Tooltip),
    { ssr: false }
)

export const BarChart = dynamic(
    () => import('recharts').then(mod => mod.BarChart),
    { ssr: false }
)

export const Bar = dynamic(
    () => import('recharts').then(mod => mod.Bar),
    { ssr: false }
)

export const XAxis = dynamic(
    () => import('recharts').then(mod => mod.XAxis),
    { ssr: false }
)

export const YAxis = dynamic(
    () => import('recharts').then(mod => mod.YAxis),
    { ssr: false }
)

export const CartesianGrid = dynamic(
    () => import('recharts').then(mod => mod.CartesianGrid),
    { ssr: false }
)

export const LineChart = dynamic(
    () => import('recharts').then(mod => mod.LineChart),
    { ssr: false }
)

export const Line = dynamic(
    () => import('recharts').then(mod => mod.Line),
    { ssr: false }
)

export const Legend = dynamic(
    () => import('recharts').then(mod => mod.Legend),
    { ssr: false }
)

export const AreaChart = dynamic(
    () => import('recharts').then(mod => mod.AreaChart),
    { ssr: false }
)

export const Area = dynamic(
    () => import('recharts').then(mod => mod.Area),
    { ssr: false }
)
