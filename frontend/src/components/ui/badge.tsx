import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
  {
    variants: {
      variant: {
        neutral: 'bg-slate-100 text-slate-600 border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger:  'bg-rose-50 text-rose-700 border-rose-200',
        info:    'bg-sky-50 text-sky-700 border-sky-200',
        accent:  'bg-teal-50 text-teal-700 border-teal-200',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

const dot: Record<string, string> = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-rose-500',
  info:    'bg-sky-500',
  accent:  'bg-teal-500',
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  const key = (variant ?? 'neutral') as string
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot[key])} />
      {children}
    </span>
  )
}
