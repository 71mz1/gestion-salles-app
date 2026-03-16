import {
  CalendarCheck,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'
import {
  affectationApi,
  etudiantApi,
  niveauApi,
  pcApi,
  type ApiEtudiant,
  type ApiNiveau,
  type ApiPc,
} from '../services/api'

const today = new Date().toISOString().split('T')[0]
const emptyForm = { nom: '', prenom: '', niveau_id: '' }
const emptyAffectation = { pc_id: '', date: today, heure_debut: '', heure_fin: '' }

export function EtudiantsPage() {
  const [etudiants, setEtudiants] = useState<ApiEtudiant[]>([])
  const [niveaux, setNiveaux] = useState<ApiNiveau[]>([])
  const [pcs, setPcs] = useState<ApiPc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<ApiEtudiant | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [affectEtudiant, setAffectEtudiant] = useState<ApiEtudiant | null>(null)
  const [affectForm, setAffectForm] = useState(emptyAffectation)
  const [savingAffectation, setSavingAffectation] = useState(false)

  useEffect(() => {
    Promise.all([etudiantApi.list(), niveauApi.list(), pcApi.list()])
      .then(([etds, nivs, pcsData]) => {
        setEtudiants(etds)
        setNiveaux(nivs)
        setPcs(pcsData)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  const filieresCount = useMemo(
    () => new Set(niveaux.map((n) => n.filiere)).size,
    [niveaux],
  )
  const semestresCount = useMemo(
    () => new Set(niveaux.map((n) => n.semestre)).size,
    [niveaux],
  )
  const affectables = useMemo(
    () => etudiants.filter((e) => e.niveau).length,
    [etudiants],
  )

  const filtered = etudiants.filter((e) => {
    const niveauLabel = e.niveau ? `${e.niveau.filiere} ${e.niveau.semestre}` : ''
    const needle = search.toLowerCase()
    return (
      `${e.nom} ${e.prenom}`.toLowerCase().includes(needle) ||
      niveauLabel.toLowerCase().includes(needle)
    )
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.niveau_id) return
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        const updated = await etudiantApi.update(editing.id, {
          nom: form.nom,
          prenom: form.prenom,
          niveau_id: parseInt(form.niveau_id),
        })
        setEtudiants((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      } else {
        const created = await etudiantApi.create({
          nom: form.nom,
          prenom: form.prenom,
          niveau_id: parseInt(form.niveau_id),
        })
        setEtudiants((prev) => [...prev, created])
      }
      closeForm()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’enregistrement')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    setError(null)
    try {
      await etudiantApi.destroy(id)
      setEtudiants((prev) => prev.filter((e) => e.id !== id))
      setConfirmDeleteId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)
    setImportError(null)
    setImportResult(null)
    try {
      const result = await etudiantApi.importCsv(importFile)
      setImportResult(result)
      const updated = await etudiantApi.list()
      setEtudiants(updated)
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : 'Erreur lors de l’import CSV')
    } finally {
      setImporting(false)
    }
  }

  async function handleAffectation(e: React.FormEvent) {
    e.preventDefault()
    if (!affectEtudiant || !affectForm.pc_id) return
    setSavingAffectation(true)
    setError(null)
    try {
      await affectationApi.create({
        pc_id: parseInt(affectForm.pc_id),
        etudiant_id: affectEtudiant.id,
        date: affectForm.date,
        heure_debut: affectForm.heure_debut,
        heure_fin: affectForm.heure_fin,
      })
      closeAffectation()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’affectation')
    } finally {
      setSavingAffectation(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpenForm(true)
  }

  function openEdit(etudiant: ApiEtudiant) {
    setEditing(etudiant)
    setForm({
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      niveau_id: etudiant.niveau ? String(etudiant.niveau.id) : '',
    })
    setOpenForm(true)
  }

  function closeForm() {
    setOpenForm(false)
    setEditing(null)
    setForm(emptyForm)
  }

  function openImportModal() {
    setOpenImport(true)
    setImportFile(null)
    setImportError(null)
    setImportResult(null)
  }

  function closeImportModal() {
    setOpenImport(false)
    setImportFile(null)
    setImportError(null)
    setImportResult(null)
  }

  function openAffectation(etudiant: ApiEtudiant) {
    setAffectEtudiant(etudiant)
    setAffectForm(emptyAffectation)
  }

  function closeAffectation() {
    setAffectEtudiant(null)
    setAffectForm(emptyAffectation)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Étudiants</h2>
          <p className="text-xs text-slate-500">{etudiants.length} étudiants enregistrés</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher…"
              className="pl-9 h-8 text-xs w-44"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" variant="secondary" onClick={openImportModal}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />Importer CSV
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Ajouter
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Total étudiants', value: etudiants.length, color: 'text-teal-600' },
          { label: 'Avec niveau', value: affectables, color: 'text-sky-600' },
          { label: 'Filières', value: filieresCount, color: 'text-violet-600' },
          { label: 'Semestres', value: semestresCount, color: 'text-emerald-600' },
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

      {/* List */}
      <div className="route-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Étudiant</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Niveau</th>
                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((etudiant, i) => (
                  <tr
                    key={etudiant.id}
                    className={cn('transition hover:bg-slate-50', i < filtered.length - 1 && 'border-b border-slate-100')}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-100 bg-teal-50">
                          <GraduationCap className="h-4 w-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{etudiant.prenom} {etudiant.nom}</p>
                          <p className="text-xs text-slate-500">ID #{etudiant.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {etudiant.niveau ? (
                        <Badge variant="accent">{etudiant.niveau.filiere} · {etudiant.niveau.semestre}</Badge>
                      ) : (
                        <Badge variant="neutral">Aucun niveau</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {confirmDeleteId === etudiant.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-500">Confirmer ?</span>
                          <button
                            onClick={() => handleDelete(etudiant.id)}
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
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openAffectation(etudiant)}>
                            <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />Affecter
                          </Button>
                          <button
                            onClick={() => openEdit(etudiant)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(etudiant.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-400">Aucun étudiant trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={closeForm}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                {editing ? 'Modifier un étudiant' : 'Ajouter un étudiant'}
              </h3>
              <button onClick={closeForm} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Prénom *</label>
                  <Input placeholder="ex: Youssef" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Nom *</label>
                  <Input placeholder="ex: Benali" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Niveau *</label>
                <select
                  value={form.niveau_id}
                  onChange={(e) => setForm({ ...form, niveau_id: e.target.value })}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                  required
                >
                  <option value="">Sélectionner un niveau…</option>
                  {niveaux.map((n) => (
                    <option key={n.id} value={n.id}>{n.filiere} – {n.semestre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={closeForm}>Annuler</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : (editing ? 'Enregistrer' : 'Ajouter')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import modal */}
      {openImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={closeImportModal}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Importer des étudiants (CSV)</h3>
              <button onClick={closeImportModal} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleImport} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Fichier CSV</label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-600 hover:file:bg-slate-200"
                />
                <p className="text-xs text-slate-400">Le CSV doit contenir les colonnes attendues par l’API.</p>
              </div>

              {importError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">{importError}</div>
              )}
              {importResult && (
                <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                  <p>{importResult.created} étudiants importés.</p>
                  {importResult.errors.length > 0 && (
                    <ul className="list-disc pl-4 text-emerald-700">
                      {importResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={closeImportModal}>Fermer</Button>
                <Button type="submit" disabled={importing || !importFile}>{importing ? 'Import…' : 'Importer'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Affectation modal */}
      {affectEtudiant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={closeAffectation}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-semibold text-slate-800">Affecter un poste</h3>
              </div>
              <button onClick={closeAffectation} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
              <p className="text-xs font-semibold text-slate-700">{affectEtudiant.prenom} {affectEtudiant.nom}</p>
              <p className="text-xs text-slate-500">{affectEtudiant.niveau ? `${affectEtudiant.niveau.filiere} · ${affectEtudiant.niveau.semestre}` : 'Aucun niveau'}</p>
            </div>
            <form onSubmit={handleAffectation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Poste *</label>
                <select
                  value={affectForm.pc_id}
                  onChange={(e) => setAffectForm({ ...affectForm, pc_id: e.target.value })}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                  required
                >
                  <option value="">Sélectionner un poste…</option>
                  {pcs.map((pc) => (
                    <option key={pc.id} value={pc.id}>
                      {pc.num_poste}{pc.salle ? ` – ${pc.salle.code_salle}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Date *</label>
                  <Input type="date" value={affectForm.date} onChange={(e) => setAffectForm({ ...affectForm, date: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Heure de début *</label>
                  <Input type="time" value={affectForm.heure_debut} onChange={(e) => setAffectForm({ ...affectForm, heure_debut: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Heure de fin *</label>
                <Input type="time" value={affectForm.heure_fin} onChange={(e) => setAffectForm({ ...affectForm, heure_fin: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={closeAffectation}>Annuler</Button>
                <Button type="submit" disabled={savingAffectation}>{savingAffectation ? 'Enregistrement…' : 'Affecter'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
