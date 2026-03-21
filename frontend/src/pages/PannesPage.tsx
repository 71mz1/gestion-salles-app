import { AlertTriangle, CheckCircle2, Clock, Pencil, Plus, Search, Trash2, Wrench, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'
import { panneApi, pcApi, professeurApi, type ApiPanne, type ApiPc } from '../services/api'
import { useAuth } from '../state/auth'

const statueLabel: Record<string, string> = {
  en_attente: 'En attente',
  en_cours:   'En cours',
  resolue:    'Résolue',
}
const statueVariant: Record<string, 'warning' | 'info' | 'success'> = {
  en_attente: 'warning',
  en_cours:   'info',
  resolue:    'success',
}

const emptyForm = { pc_id: '', descr_panne: '', date_panne: new Date().toISOString().split('T')[0] }

export function PannesPage() {
  const { role } = useAuth()
  const [pannes, setPannes] = useState<ApiPanne[]>([])
  const [pcs, setPcs] = useState<ApiPc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [interventionPanne, setInterventionPanne] = useState<ApiPanne | null>(null)
  const [interventionForm, setInterventionForm] = useState({
    statue: '' as 'en_attente' | 'en_cours' | 'resolue' | '',
    descr_reparation: '',
    date_reparation: '',
  })
  const [savingIntervention, setSavingIntervention] = useState(false)

  useEffect(() => {
    const fetchPannes = role === 'professeur'
      ? professeurApi.pannes() as unknown as Promise<ApiPanne[]>
      : panneApi.list()

    Promise.all([fetchPannes, pcApi.list()])
      .then(([p, pcsData]) => { setPannes(p); setPcs(pcsData) })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [role])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pc_id) return
    setSaving(true)
    try {
      let created: ApiPanne
      if (role === 'professeur') {
        const profPanne = await professeurApi.declarerPanne({
          pc_id: parseInt(form.pc_id),
          descr_panne: form.descr_panne,
          date_panne: form.date_panne,
        })
        created = profPanne as unknown as ApiPanne
      } else {
        created = await panneApi.create({
          pc_id: parseInt(form.pc_id),
          descr_panne: form.descr_panne,
          date_panne: form.date_panne,
          prof_id: 1,
        })
      }
      setPannes((prev) => [created, ...prev])
      setForm(emptyForm)
      setOpen(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la déclaration')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      await panneApi.destroy(id)
      setPannes((prev) => prev.filter((p) => p.id !== id))
      setConfirmDeleteId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  function openIntervention(p: ApiPanne) {
    setInterventionPanne(p)
    setInterventionForm({
      statue: p.statue,
      descr_reparation: p.descr_reparation ?? '',
      date_reparation: p.date_reparation ?? '',
    })
  }

  async function handleIntervention(e: React.FormEvent) {
    e.preventDefault()
    if (!interventionPanne) return
    setSavingIntervention(true)
    try {
      const payload: { statue?: string; descr_reparation?: string; date_reparation?: string } = {}
      if (interventionForm.statue) payload.statue = interventionForm.statue
      if (interventionForm.descr_reparation) payload.descr_reparation = interventionForm.descr_reparation
      if (interventionForm.date_reparation) payload.date_reparation = interventionForm.date_reparation
      const updated = await panneApi.update(interventionPanne.id, payload)
      setPannes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setInterventionPanne(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la mise à jour")
    } finally {
      setSavingIntervention(false)
    }
  }

  const count = (s: string) => pannes.filter((p) => p.statue === s).length

  const filtered = pannes.filter(
    (p) =>
      (p.pc?.num_poste ?? '').toLowerCase().includes(search.toLowerCase()) ||
      p.descr_panne.toLowerCase().includes(search.toLowerCase()) ||
      (p.pc?.salle?.code_salle ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Gestion des pannes</h2>
          <p className="text-xs text-slate-500">Déclaration, suivi et résolution des incidents</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Rechercher…" className="pl-9 h-8 text-xs w-44" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {role === 'professeur' && (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />Déclarer une panne
            </Button>
          )}
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'En attente', statue: 'en_attente', v: 'warning' as const },
          { label: 'En cours',   statue: 'en_cours',   v: 'info'    as const },
          { label: 'Résolues',   statue: 'resolue',    v: 'success' as const },
        ].map((s) => (
          <div key={s.label} className="route-card rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm text-center">
            <p className="text-2xl font-bold text-slate-800">{count(s.statue)}</p>
            <Badge variant={s.v} className="mt-1">{s.label}</Badge>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      {/* List */}
      <div className="route-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Suivi des pannes</h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition hover:border-slate-200"
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
                      : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {p.pc?.num_poste ?? '—'} {p.pc?.salle?.code_salle ? `· ${p.pc.salle.code_salle}` : ''}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{p.descr_panne}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={statueVariant[p.statue] ?? 'warning'}>
                      {statueLabel[p.statue] ?? p.statue}
                    </Badge>
                    <span className="text-[10px] text-slate-400">{p.date_panne}</span>
                  </div>

                  {/* زر Modifier — technicien و admin فقط */}
                  {role !== 'professeur' && (
                    <button
                      onClick={() => openIntervention(p)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition-colors"
                      title="Ajouter une intervention"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* زر Supprimer — admin فقط */}
                  {role === 'administrateur' && (
                    confirmDeleteId === p.id ? (
                      <div className="flex items-center gap-1.5">
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
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">Aucune panne enregistrée.</p>
            )}
          </div>
        )}
      </div>

      {/* Declare panne modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Déclarer une panne</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">PC concerné *</label>
                <select
                  value={form.pc_id}
                  onChange={(e) => setForm({ ...form, pc_id: e.target.value })}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                  required
                >
                  <option value="">Sélectionner un PC…</option>
                  {pcs.map((pc) => (
                    <option key={pc.id} value={pc.id}>
                      {pc.num_poste}{pc.salle ? ` – ${pc.salle.code_salle}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Date de panne *</label>
                <Input type="date" value={form.date_panne} onChange={(e) => setForm({ ...form, date_panne: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Description *</label>
                <textarea
                  placeholder="Décrivez le problème observé…"
                  rows={3}
                  value={form.descr_panne}
                  onChange={(e) => setForm({ ...form, descr_panne: e.target.value })}
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Envoi…' : 'Soumettre'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intervention modal */}
      {interventionPanne && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setInterventionPanne(null)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-semibold text-slate-800">Intervention / Mise à jour</h3>
              </div>
              <button onClick={() => setInterventionPanne(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
              <p className="text-xs font-semibold text-slate-700">{interventionPanne.pc?.num_poste ?? '—'}{interventionPanne.pc?.salle?.code_salle ? ` · ${interventionPanne.pc.salle.code_salle}` : ''}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{interventionPanne.descr_panne}</p>
            </div>
            <form onSubmit={handleIntervention} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Statut</label>
                <select
                  value={interventionForm.statue}
                  onChange={(e) => setInterventionForm({ ...interventionForm, statue: e.target.value as typeof interventionForm.statue })}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                >
                  <option value="en_attente">En attente</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolue">Résolue</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Description de la réparation</label>
                <textarea
                  placeholder="Décrivez les actions effectuées…"
                  rows={3}
                  value={interventionForm.descr_reparation}
                  onChange={(e) => setInterventionForm({ ...interventionForm, descr_reparation: e.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Date de réparation</label>
                <Input type="date" value={interventionForm.date_reparation} onChange={(e) => setInterventionForm({ ...interventionForm, date_reparation: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => setInterventionPanne(null)}>Annuler</Button>
                <Button type="submit" disabled={savingIntervention}>{savingIntervention ? 'Enregistrement…' : 'Enregistrer'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}