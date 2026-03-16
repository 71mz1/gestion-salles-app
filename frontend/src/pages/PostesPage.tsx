import { Cpu, HardDrive, Monitor, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'
import { pcApi, sallesApi, type ApiPc, type ApiSalle } from '../services/api'

const etatVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  fonctionnel:     'success',
  en_maintenance:  'warning',
  en_panne:        'danger',
}
const etatLabel: Record<string, string> = {
  fonctionnel:    'Fonctionnel',
  en_maintenance: 'Maintenance',
  en_panne:       'En panne',
}
const iconStyle: Record<string, string> = {
  fonctionnel:    'border-emerald-100 bg-emerald-50 text-emerald-600',
  en_maintenance: 'border-amber-100 bg-amber-50 text-amber-600',
  en_panne:       'border-rose-100 bg-rose-50 text-rose-600',
}

const emptyForm = { num_poste: '', salle_id: '', processeur: '', ram: '', systeme_exploitation: '', etat: 'fonctionnel' }

export function PostesPage() {
  const [postes, setPostes] = useState<ApiPc[]>([])
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
    Promise.all([pcApi.list(), sallesApi.list()])
      .then(([pcs, sl]) => { setPostes(pcs); setSalles(sl) })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.salle_id) return
    setSaving(true)
    try {
      const created = await pcApi.create({
        num_poste: form.num_poste,
        salle_id: parseInt(form.salle_id),
        processeur: form.processeur || undefined,
        ram: form.ram || undefined,
        systeme_exploitation: form.systeme_exploitation || undefined,
        etat: form.etat,
      })
      setPostes((prev) => [...prev, created])
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
      await pcApi.destroy(id)
      setPostes((prev) => prev.filter((p) => p.id !== id))
      setConfirmDeleteId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = postes.filter(
    (p) =>
      p.num_poste.toLowerCase().includes(search.toLowerCase()) ||
      (p.salle?.code_salle ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Postes informatiques</h2>
          <p className="text-xs text-slate-500">
            {postes.length} postes · {postes.filter((p) => p.etat === 'fonctionnel').length} fonctionnels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Rechercher un poste…" className="pl-9 h-8 text-xs w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Ajouter
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="route-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse h-36" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="route-card group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', iconStyle[p.etat])}>
                    <Monitor className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.num_poste}</p>
                    <p className="text-xs text-slate-500">{p.salle?.code_salle ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={etatVariant[p.etat]}>{etatLabel[p.etat] ?? p.etat}</Badge>
                  {confirmDeleteId === p.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50"
                      >
                        {deleting ? '…' : 'Oui'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Non
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                {p.processeur && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Cpu className="h-3 w-3 text-slate-400" />{p.processeur}
                  </div>
                )}
                {p.ram && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <HardDrive className="h-3 w-3 text-slate-400" />RAM {p.ram}
                  </div>
                )}
                {p.systeme_exploitation && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Monitor className="h-3 w-3 text-slate-400" />{p.systeme_exploitation}
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 py-12 text-center text-sm text-slate-400">Aucun poste trouvé.</div>
          )}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Ajouter un poste</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">ID poste *</label>
                  <Input placeholder="ex: PC-S05-01" value={form.num_poste} onChange={(e) => setForm({ ...form, num_poste: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Salle *</label>
                  <select
                    value={form.salle_id}
                    onChange={(e) => setForm({ ...form, salle_id: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                    required
                  >
                    <option value="">Sélectionner…</option>
                    {salles.map((s) => <option key={s.id} value={s.id}>{s.code_salle} – {s.nom_salle}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">CPU</label>
                  <Input placeholder="ex: Intel i5-12400" value={form.processeur} onChange={(e) => setForm({ ...form, processeur: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">RAM</label>
                  <Input placeholder="ex: 16 Go" value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">OS</label>
                  <Input placeholder="ex: Windows 11" value={form.systeme_exploitation} onChange={(e) => setForm({ ...form, systeme_exploitation: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">État</label>
                  <select
                    value={form.etat}
                    onChange={(e) => setForm({ ...form, etat: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                  >
                    <option value="fonctionnel">Fonctionnel</option>
                    <option value="en_maintenance">Maintenance</option>
                    <option value="en_panne">En panne</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Ajouter le poste'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
