import { CalendarDays, ChevronLeft, ChevronRight, Filter, Plus } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

type ShiftVariant = 'info' | 'warning' | 'danger' | 'success'
type Shift = { title: string; detail: string; variant: ShiftVariant }

const days = ['Sam', 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven']

const rows: Array<{ name: string; total: string; shifts: Array<Shift | null> }> = [
  {
    name: 'Pr. El Idrissi', total: '8h',
    shifts: [
      { title: '08:30 – 12:30', detail: 'Salle S01 · GI1', variant: 'info' },
      null, null, null,
      { title: '14:00 – 16:30', detail: 'Salle S02 · GI2', variant: 'success' },
      null, null,
    ],
  },
  {
    name: 'Pr. Benali', total: '6h',
    shifts: [
      null,
      { title: '08:00 – 10:00', detail: 'Salle S03 · Data', variant: 'warning' },
      null,
      { title: '07:30 – 09:30', detail: 'Salle S01 · Dev', variant: 'info' },
      null, null, null,
    ],
  },
  {
    name: 'Pr. Lamrani', total: '9h',
    shifts: [
      { title: '08:00 – 13:00', detail: 'Salle S01 · GI3', variant: 'info' },
      null, null, null, null,
      { title: '09:00 – 13:00', detail: 'Salle S02 · IA', variant: 'danger' },
      null,
    ],
  },
  {
    name: 'Pr. Tahiri', total: '10h',
    shifts: [
      { title: '08:00 – 12:00', detail: 'Salle S04 · Réseau', variant: 'info' },
      null,
      { title: '10:00 – 13:00', detail: 'Salle S02 · Sys', variant: 'success' },
      null,
      { title: '09:00 – 17:00', detail: 'Salle S01 · DS', variant: 'info' },
      null, null,
    ],
  },
]

const cellStyle: Record<ShiftVariant, string> = {
  info:    'bg-sky-50 border-sky-200',
  success: 'bg-emerald-50 border-emerald-200',
  warning: 'bg-amber-50 border-amber-200',
  danger:  'bg-rose-50 border-rose-200',
}

function ShiftCell({ shift }: { shift: Shift | null }) {
  if (!shift) return <td className="h-[88px] min-w-[130px] border-l border-slate-100 bg-white" />
  return (
    <td className="h-[88px] min-w-[130px] border-l border-slate-100 bg-white p-2 align-top">
      <div className={`h-full rounded-xl border p-2 ${cellStyle[shift.variant]}`}>
        <p className="text-xs font-semibold text-slate-800">{shift.title}</p>
        <p className="mt-0.5 text-[10px] text-slate-500">{shift.detail}</p>
        <Badge variant={shift.variant} className="mt-1.5 text-[10px]">Planifié</Badge>
      </div>
    </td>
  )
}

export function EmploisDuTempsPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Emplois du temps</h2>
          <p className="text-xs text-slate-500">Semaine du 15 au 22 juillet 2025</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" className="h-8 w-8"><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />15 – 22 juillet
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8"><ChevronRight className="h-3.5 w-3.5" /></Button>
          <Button variant="secondary" size="icon" className="h-8 w-8"><Filter className="h-3.5 w-3.5" /></Button>
          <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Ajouter</Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="route-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-[180px] border-b border-slate-200 px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Enseignant
                </th>
                {days.map((day) => (
                  <th key={day} className="border-b border-l border-slate-200 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.name} className={ri < rows.length - 1 ? 'border-b border-slate-100' : ''}>
                  <td className="border-r border-slate-100 px-5 py-4 align-middle">
                    <p className="text-sm font-semibold text-slate-800">{row.name}</p>
                    <p className="text-xs text-slate-400">{row.total} / sem.</p>
                  </td>
                  {row.shifts.map((shift, idx) => (
                    <ShiftCell key={`${row.name}-${days[idx]}`} shift={shift} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
