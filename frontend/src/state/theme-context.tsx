import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeMode = 'clair' | 'sombre' | 'système'

export const accentColors: Record<string, { css: string; light: string; text: string; border: string; tw: string; label: string }> = {
  teal:   { css: '#14b8a6', light: '#f0fdfa', text: '#0f766e', border: '#99f6e4', tw: 'bg-teal-500',   label: 'Menthe' },
  sky:    { css: '#0ea5e9', light: '#f0f9ff', text: '#0369a1', border: '#bae6fd', tw: 'bg-sky-500',    label: 'Ciel' },
  violet: { css: '#8b5cf6', light: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', tw: 'bg-violet-500', label: 'Violet' },
  rose:   { css: '#f43f5e', light: '#fff1f2', text: '#be123c', border: '#fecdd3', tw: 'bg-rose-500',   label: 'Rose' },
  amber:  { css: '#f59e0b', light: '#fffbeb', text: '#b45309', border: '#fde68a', tw: 'bg-amber-500',  label: 'Ambre' },
}

type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  accent: string
  setAccent: (a: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'sombre' || (theme === 'système' && prefersDark)
  document.documentElement.classList.toggle('dark', dark)
}

function applyAccent(key: string) {
  const c = accentColors[key] ?? accentColors.teal
  const root = document.documentElement
  root.style.setProperty('--accent',        c.css)
  root.style.setProperty('--accent-light',  c.light)
  root.style.setProperty('--accent-text',   c.text)
  root.style.setProperty('--accent-border', c.border)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState]   = useState<ThemeMode>('clair')
  const [accent, setAccentState] = useState('teal')

  function setTheme(t: ThemeMode) {
    setThemeState(t)
    applyTheme(t)
  }

  function setAccent(a: string) {
    setAccentState(a)
    applyAccent(a)
  }

  // Apply on mount
  useEffect(() => {
    applyTheme(theme)
    applyAccent(accent)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
