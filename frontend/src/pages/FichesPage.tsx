import { Download, FileText, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { niveauApi, type ApiNiveau } from '../services/api'

interface Fiche {
  id: string
  type: 'Fiche PC' | 'Fiche Salle'
  date: string
  statut: 'Prête' | 'Générée' | 'En attente'
  size: string
  niveau?: ApiNiveau
}

export function FichesPage() {
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [niveaux, setNiveaux] = useState<ApiNiveau[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      niveauApi.list(),
    ])
      .then(([nivs]) => {
        setNiveaux(nivs)
        // Generate mock fiches based on actual niveaux
        const generatedFiches: Fiche[] = [
          { id: 'F-PC-S01-01', type: 'Fiche PC', date: '2026-03-07', statut: 'Prête', size: '48 ko' },
          { id: 'F-SALLE-S01', type: 'Fiche Salle', date: '2026-03-07', statut: 'Prête', size: '32 ko' },
          { id: 'F-PC-S02-08', type: 'Fiche PC', date: '2026-03-06', statut: 'Générée', size: '51 ko' },
          { id: 'F-SALLE-S03', type: 'Fiche Salle', date: '2026-03-06', statut: 'Prête', size: '30 ko' },
          // Add fiches for each niveau
          ...nivs.map((n, i) => ({
            id: `F-NIVEAU-${n.filiere.substring(0, 3).toUpperCase()}-${n.semestre.toUpperCase()}`,
            type: 'Fiche Salle' as const,
            date: new Date().toISOString().split('T')[0],
            statut: i % 2 === 0 ? 'Prête' as const : 'Générée' as const,
            size: `${30 + i * 5} ko`,
            niveau: n,
          })),
        ]
        setFiches(generatedFiches)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Génération des fiches</h2>
          <p className="text-xs text-slate-500">Export PDF déclenché côté backend · {niveaux.length} niveaux actifs</p>
        </div>
        <Button variant="secondary" size="sm">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Tout régénérer
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Total fiches',  value: fiches.length,                                         color: 'text-teal-600' },
          { label: 'Fiches PC',     value: fiches.filter((f) => f.type === 'Fiche PC').length,    color: 'text-sky-600' },
          { label: 'Fiches Salles', value: fiches.filter((f) => f.type === 'Fiche Salle').length, color: 'text-violet-600' },
          { label: 'Prêtes',        value: fiches.filter((f) => f.statut === 'Prête').length,     color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="route-card rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* List */}
      <div className="route-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Chargement…
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {fiches.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Aucune fiche générée.
              </div>
            ) : (
              fiches.map((fiche) => (
                <div
                  key={fiche.id}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50">
                    <FileText className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{fiche.id}</p>
                    <p className="text-xs text-slate-500">
                      {fiche.type} · {fiche.date} · {fiche.size}
                      {fiche.niveau && ` · ${fiche.niveau.filiere} ${fiche.niveau.semestre}`}
                    </p>
                  </div>
                  <Badge variant={fiche.statut === 'Prête' ? 'success' : 'info'}>{fiche.statut}</Badge>
                  <Button variant="secondary" size="sm">
                    <Download className="mr-1.5 h-3.5 w-3.5" />PDF
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
