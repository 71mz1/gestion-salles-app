import {
  Bell,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LaptopMinimal,
  LogOut,
  Monitor,
  Search,
  Settings,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../../state/auth'
import { authApi } from '../../services/api'
import { cn } from '../../lib/utils'

const postesEnPanne: { id: string; salle: string; desc: string; since: string }[] = []

type NavItem = {
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord',  href: '/tableau-de-bord',  icon: LayoutDashboard },
  { label: 'Salles',           href: '/salles',            icon: LaptopMinimal },
  { label: 'Postes',           href: '/postes',            icon: Monitor },
  { label: 'Pannes',           href: '/pannes',            icon: TriangleAlert },
  { label: 'Etudiants',        href: '/etudiants',         icon: GraduationCap },
  { label: 'Utilisateurs',     href: '/utilisateurs',      icon: Users },
  { label: 'Fiches',           href: '/fiches',            icon: FileText },
]

const roleLabel: Record<string, string> = {
  administrateur: 'Administrateur',
  technicien:     'Technicien',
  professeur:     'Professeur',
}
const roleGrad: Record<string, string> = {
  administrateur: 'from-teal-500 to-cyan-400',
  technicien:     'from-sky-500 to-blue-400',
  professeur:     'from-violet-500 to-purple-400',
}

export function AppShell() {
  const location = useLocation()
  const { role, logout } = useAuth()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement | null>(null)

  async function handleLogout() {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  useLayoutEffect(() => {
    if (!panelRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.route-card',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05 },
      )
    }, panelRef)
    return () => ctx.revert()
  }, [location.pathname])

  const filteredItems = useMemo(() => {
    if (role === 'administrateur') return navItems
    if (role === 'technicien') return navItems.filter((i) => i.href !== '/utilisateurs')
    return navItems.filter((i) => !['/utilisateurs', '/fiches'].includes(i.href))
  }, [role])

  const currentLabel = filteredItems.find((i) => i.href === location.pathname)?.label ?? 'Dashboard'
  const grad = roleGrad[role ?? ''] ?? 'from-teal-500 to-cyan-400'
  const { user } = useAuth()
  const fullName = user ? `${user.prenom} ${user.nom}` : roleLabel[role ?? ''] ?? ''

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">

      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col bg-white border-r border-slate-100 shadow-[1px_0_0_0_#f1f5f9]">

        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-100">
          <div className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white text-sm font-bold shadow-md',
            grad,
          )}>
            E
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-800 tracking-tight">ENCGO</p>
            <p className="text-[10px] text-slate-400 font-medium">Gestion des salles</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 cursor-pointer hover:border-slate-300 hover:bg-white transition-colors">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span>Recherche rapide…</span>
            <kbd className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-mono text-slate-400">⌘K</kbd>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Menu principal
          </p>
          {filteredItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                )}
                style={active ? {
                  backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                  color: 'var(--accent-text)',
                  outline: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                } : {}}
              >
                {/* Active left bar */}
                {active && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
                <Icon
                  className="h-4 w-4 shrink-0 transition-colors"
                  style={active ? { color: 'var(--accent)' } : {}}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && !active && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <ChevronRight className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-slate-100" />

        {/* Footer actions */}
        <div className="px-3 py-3 space-y-0.5">
          <Link to="/parametres" className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
            <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            Paramètres
          </Link>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
            Se déconnecter
          </button>
        </div>

        {/* User card */}
        <div className="mx-3 mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[11px] font-bold text-white uppercase shadow-sm',
              grad,
            )}>
              {role?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">ENCGO · Oujda</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white shrink-0" title="En ligne" />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col pl-[240px]">

        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">ENCGO</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="font-semibold text-slate-800">{currentLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:border-slate-300"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-1 ring-white" />
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TriangleAlert className="h-3.5 w-3.5 text-rose-500" />
                      <span className="text-sm font-semibold text-slate-800">Postes en panne</span>
                      <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                        {postesEnPanne.length}
                      </span>
                    </div>
                    <button onClick={() => setNotifOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* List */}
                  <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {postesEnPanne.map((p) => (
                      <div key={p.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 border border-rose-100">
                          <Monitor className="h-3.5 w-3.5 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{p.id}</p>
                          <p className="text-xs text-slate-500 truncate">{p.desc}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">Salle {p.salle} · {p.since}</p>
                        </div>
                        <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600">
                          En panne
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-100 px-4 py-2.5">
                    <Link
                      to="/postes"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Voir tous les postes <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page */}
        <main ref={panelRef} className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
