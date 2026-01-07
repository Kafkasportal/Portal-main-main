import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 [a&]:hover:bg-slate-300',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border-border text-foreground bg-background [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success:
          'border-transparent bg-emerald-500 text-white [a&]:hover:bg-emerald-600',
        warning:
          'border-transparent bg-amber-500 text-white [a&]:hover:bg-amber-600',
        // New themed variants for member types
        teal: 'border-transparent bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200 [a&]:hover:bg-teal-200',
        purple:
          'border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 [a&]:hover:bg-purple-200',
        blue: 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 [a&]:hover:bg-blue-200',
        emerald:
          'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200 [a&]:hover:bg-emerald-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
