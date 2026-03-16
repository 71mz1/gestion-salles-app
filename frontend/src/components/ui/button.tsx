import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:   'text-white shadow-sm',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
        ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        danger:    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
        outline:   'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-11 px-6 text-base',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, style, ...props }: ButtonProps) {
  const isDefault = !variant || variant === 'default'
  const accentStyle: CSSProperties = isDefault
    ? { backgroundColor: 'var(--accent)', ...style }
    : (style ?? {})

  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      style={accentStyle}
      {...props}
    />
  )
}
