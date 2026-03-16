import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none',
        'placeholder:text-slate-400 transition-colors',
        'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10',
        className,
      )}
      {...props}
    />
  )
}
