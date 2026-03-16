import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  LaptopMinimal,
  TrendingUp,
  Wrench,
  Zap,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Badge } from '../components/ui/badge'
import { cn } from '../lib/utils'
import { dashboardApi, type DashboardStats } from '../services/api'

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 56; const H = 24
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(' ')
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
    </svg>
  )
}

function statueLabel(s: string) {
  if (s === 'en_attente') return 'En attente'
  if (s === 'en_cours') return 'En cours'
  if (s === 'resolue') return 'Résolue'
  return s
}

function statueVariant(s: string): 'warning' | 'info' | 'success' {
  if (s === 'resolue') return 'success'
  if (s === 'en_cours') return 'info'
  return 'warning'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `il y a ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

export function DashboardPage() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur'))
  }, [])

  const kpis = stats
    ? [
        {
          label: 'Salles actives',
          value: stats.salles,
          icon: LaptopMinimal,
          iconBg: 'bg-teal-50',
          iconColor: 'text-teal-600',
          spark: [40, 55, 50, 60, 58, 70, 68, stats.salles],
          sparkColor: '#0d9488',
        },
        {
          label: 'Postes fonctionnels',
          value: stats.pcs_fonctionnels,
          icon: TrendingUp,
          iconBg: 'bg-sky-50',
          iconColor: 'text-sky-600',
          spark: [80, 75, 85, 78, 90, 88, 92, stats.pcs_fonctionnels],
          sparkColor: '#0284c7',
        },
        {
          label: 'Pannes en attente',
          value: stats.pannes_en_attente,
          icon: AlertTriangle,
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          spark: [30, 45, 35, 50, 40, 38, 42, stats.pannes_en_attente],
          sparkColor: '#d97706',
        },
        {
          label: 'En cours',
          value: stats.pannes_en_cours,
          icon: Wrench,
          iconBg: 'bg-violet-50',
          iconColor: 'text-violet-600',
          spark: [20, 35, 28, 40, 38, 50, 45, stats.pannes_en_cours],
          sparkColor: '#7c3aed',
        },
      ]
    : []

  useLayoutEffect(() => {
    if (!ref.current || !stats) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.kpi-card',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'power3.out' },
      )
      gsap.fromTo('.dash-row',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.25 },
      )
      document.querySelectorAll<HTMLElement>('.kpi-value').forEach((el) => {
        const target = parseInt(el.dataset.value ?? '0', 10)
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target, duration: 0.9, ease: 'power2.out', delay: 0.1,
          onUpdate: () => { el.textContent = Math.round(obj.val).toString() },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [stats])

  return (
    <div ref={ref} className="space-y-5">

      {/* Hero */}
      <div className="route-card relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-teal-600 to-cyan-500 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium">
            <Zap className="h-3 w-3" /> Vue globale
          </span>
        </div>
        <h1 className="relative text-2xl font-bold tracking-tight">Tableau de bord de supervision</h1>
        <p className="relative mt-1.5 text-sm text-white/70">
          Suivi des salles, postes et incidents en temps réel · ENCGO Oujda
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Erreur lors du chargement : {error}
        </div>
      )}

      {/* KPIs */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => {
            const Icon = k.icon
            return (
              <div
                key={k.label}
                className="kpi-card route-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{k.label}</p>
                    <p
                      className="kpi-value mt-1.5 text-3xl font-bold tabular-nums text-slate-800"
                      data-value={k.value}
                    >{k.value}</p>
                  </div>
                  <div className={cn('rounded-xl p-2.5', k.iconBg)}>
                    <Icon className={cn('h-4 w-4', k.iconColor)} />
                  </div>
                </div>
                <div className="mt-3">
                  <Sparkline data={k.spark} color={k.sparkColor} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!stats && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="route-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      )}

      {/* Bottom grid */}
      {stats && (
        <div className="grid gap-4 xl:grid-cols-2">

          {/* Pannes récentes */}
          <div className="dash-row route-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Alertes pannes récentes</h2>
              <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-teal-600 transition-colors">
                Voir tout <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {stats.recent_pannes.length === 0 && (
                <p className="text-xs text-slate-400">Aucune panne récente.</p>
              )}
              {stats.recent_pannes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition hover:border-slate-200"
                >
                  <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', {
                    'bg-emerald-50': p.statue === 'resolue',
                    'bg-sky-50':     p.statue === 'en_cours',
                    'bg-amber-50':   p.statue === 'en_attente',
                  })}>
                    {p.statue === 'resolue'
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      : p.statue === 'en_cours'
                        ? <Clock className="h-3.5 w-3.5 text-sky-600" />
                        : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {p.pc?.num_poste ?? '—'} {p.pc?.code_salle ? `· ${p.pc.code_salle}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{p.descr_panne}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={statueVariant(p.statue)}>
                      {statueLabel(p.statue)}
                    </Badge>
                    <span className="text-[10px] text-slate-400">{timeAgo(p.date_panne)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary card */}
          <div className="dash-row route-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">État des postes</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Fonctionnels', value: stats.pcs_fonctionnels, total: stats.pcs_total, color: 'from-teal-500 to-cyan-400' },
                { label: 'En panne',     value: stats.pcs_en_panne,     total: stats.pcs_total, color: 'from-rose-500 to-red-400' },
                { label: 'Maintenance',  value: stats.pcs_maintenance,  total: stats.pcs_total, color: 'from-amber-500 to-yellow-400' },
              ].map((o) => {
                const pct = stats.pcs_total > 0 ? Math.round((o.value / stats.pcs_total) * 100) : 0
                return (
                  <div key={o.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800">{o.label}</p>
                      <span className="text-xs font-semibold text-teal-600">{o.value} / {o.total}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${o.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
