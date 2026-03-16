import { LaptopMinimal, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'
import { sallesApi, type ApiSalle } from '../services/api'


const emptyForm = { nom_salle: '', code_salle: '', capacite: '', nb_postes: '' }

export function SallesPage() {
  const [salles, setSalles] = useState<ApiSalle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    sallesApi.list()
      .then(setSalles)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await sallesApi.create({
        nom_salle: form.nom_salle,
        code_salle: form.code_salle,
        capacite: parseInt(form.capacite) || 0,
        nb_postes: parseInt(form.nb_postes) || 0,
      })
      setSalles((prev) => [...prev, created])
      setForm(emptyForm)
      setOpen(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      await sallesApi.destroy(id)
      setSalles((prev) => prev.filter((s) => s.id !== id))
      setConfirmDeleteId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = salles.filter(
    (s) =>
      s.code_salle.toLowerCase().includes(search.toLowerCase()) ||
      s.nom_salle.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Salles informatiques</h2>
          <p className="text-xs text-slate-500">{salles.length} salles · {salles.reduce((a, s) => a + s.pcs_count, 0)} postes au total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Rechercher une salle…" className="pl-9 h-8 text-xs w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Ajouter
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Total salles',   value: salles.length,                                              color: 'text-teal-600' },
          { label: 'Total postes',   value: salles.reduce((a, s) => a + s.pcs_count, 0),                color: 'text-sky-600' },
          { label: 'Capacité totale',value: salles.reduce((a, s) => a + s.capacite, 0),                 color: 'text-emerald-600' },
          { label: 'Nb postes déclarés', value: salles.reduce((a, s) => a + (s.nb_postes ?? 0), 0),     color: 'text-violet-600' },
        ].map((s) => (
          <div key={s.label} className="route-card rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      {/* Table */}
      <div className="route-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Code</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Nom</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Capacité</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Postes (réels)</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Postes déclarés</th>
                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((salle, i) => (
                  <tr key={salle.id} className={cn('transition hover:bg-slate-50', i < filtered.length - 1 && 'border-b border-slate-100')}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 border border-teal-100">
                          <LaptopMinimal className="h-3.5 w-3.5 text-teal-600" />
                        </div>
                        <span className="font-semibold text-slate-800">{salle.code_salle}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{salle.nom_salle}</td>
                    <td className="px-5 py-4 text-slate-600">{salle.capacite} places</td>
                    <td className="px-5 py-4 text-slate-600">{salle.pcs_count}</td>
                    <td className="px-5 py-4 text-slate-600">{salle.nb_postes ?? 0}</td>
                    <td className="px-5 py-4 text-right">
                      {confirmDeleteId === salle.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-500">Confirmer ?</span>
                          <button
                            onClick={() => handleDelete(salle.id)}
                            disabled={deleting}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50"
                          >
                            {deleting ? '…' : 'Oui'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(salle.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">Aucune salle trouvée.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Ajouter une salle</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Code salle *</label>
                  <Input placeholder="ex: S05" value={form.code_salle} onChange={(e) => setForm({ ...form, code_salle: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Capacité *</label>
                  <Input type="number" min="1" placeholder="ex: 30" value={form.capacite} onChange={(e) => setForm({ ...form, capacite: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Nom de la salle *</label>
                <Input placeholder="ex: Salle Informatique 1" value={form.nom_salle} onChange={(e) => setForm({ ...form, nom_salle: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Nombre de postes</label>
                <Input type="number" min="0" placeholder="ex: 30" value={form.nb_postes} onChange={(e) => setForm({ ...form, nb_postes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Ajouter la salle'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
