import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'
import { professeurAdminApi, type ApiProfesseur } from '../services/api'

const emptyForm = { nom: '', prenom: '', email: '' }

export function ProfesseursPage() {
  const [professeurs, setProfesseurs] = useState<ApiProfesseur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<ApiProfesseur | null>(null)
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

  useEffect(() => {
    professeurAdminApi.list()
      .then(setProfesseurs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const needle = search.toLowerCase()
    return professeurs.filter(
      (p) =>
        p.nom.toLowerCase().includes(needle) ||
        p.prenom.toLowerCase().includes(needle) ||
        p.email.toLowerCase().includes(needle),
    )
  }, [professeurs, search])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom || !form.prenom || !form.email) return
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        const updated = await professeurAdminApi.update(editing.id, form)
        setProfesseurs((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      } else {
        const created = await professeurAdminApi.create(form)
        setProfesseurs((prev) => [...prev, created])
      }
      closeForm()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    setError(null)
    try {
      await professeurAdminApi.destroy(id)
      setProfesseurs((prev) => prev.filter((p) => p.id !== id))
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
      const result = await professeurAdminApi.importCsv(importFile)
      setImportResult(result)
      const refreshed = await professeurAdminApi.list()
      setProfesseurs(refreshed)
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : "Erreur lors de l'import")
    } finally {
      setImporting(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpenForm(true)
  }

  function openEdit(prof: ApiProfesseur) {
    setEditing(prof)
    setForm({ nom: prof.nom, prenom: prof.prenom, email: prof.email })
    setOpenForm(true)
  }

  function closeForm() {
    setOpenForm(false)
    setEditing(null)
    setForm(emptyForm)
  }

  function closeImport() {
    setOpenImport(false)
    setImportFile(null)
    setImportResult(null)
    setImportError(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Gestion des Professeurs</h2>
          <p className="text-xs text-slate-500">{professeurs.length} professeurs enregistrés</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher un professeur…"
              className="pl-9 h-8 text-xs w-52"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" variant="secondary" onClick={() => setOpenImport(true)}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import CSV
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {[
          { label: 'Total professeurs', value: professeurs.length, color: 'text-teal-600' },
          { label: 'Résultats filtrés', value: filtered.length, color: 'text-sky-600' },
        ].map((s) => (
          <div
            key={s.label}
            className="route-card rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
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
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Nom
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Prénom
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Créé le
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prof, i) => (
                  <tr
                    key={prof.id}
                    className={cn(
                      'transition hover:bg-slate-50',
                      i < filtered.length - 1 && 'border-b border-slate-100',
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 border border-teal-100">
                          <UserRound className="h-3.5 w-3.5 text-teal-600" />
                        </div>
                        <span className="font-semibold text-slate-800">{prof.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{prof.prenom}</td>
                    <td className="px-5 py-4 text-slate-600">{prof.email}</td>
                    <td className="px-5 py-4 text-slate-600 text-xs">
                      {prof.created_at
                        ? new Date(prof.created_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {confirmDeleteId === prof.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-500">Confirmer ?</span>
                          <button
                            onClick={() => handleDelete(prof.id)}
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
                          <button
                            onClick={() => openEdit(prof)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(prof.id)}
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
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                      Aucun professeur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {openForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                {editing ? 'Modifier un professeur' : 'Ajouter un professeur'}
              </h3>
              <button
                onClick={closeForm}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Nom *
                </label>
                <Input
                  placeholder="ex: Benali"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Prénom *
                </label>
                <Input
                  placeholder="ex: Ahmed"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="ex: ahmed.benali@encgo.ma"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Ajouter le professeur'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {openImport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={closeImport}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Import CSV — Professeurs</h3>
              <button
                onClick={closeImport}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 text-xs text-slate-500">
              Le fichier CSV doit contenir une ligne d'en-tête suivie des colonnes :{' '}
              <span className="font-mono font-semibold text-slate-700">nom, prenom, email</span>
            </p>

            <form onSubmit={handleImport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Fichier CSV *
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200 transition-colors"
                  onChange={(e) => {
                    setImportFile(e.target.files?.[0] ?? null)
                    setImportResult(null)
                    setImportError(null)
                  }}
                  required
                />
              </div>

              {importError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
                  {importError}
                </div>
              )}

              {importResult && (
                <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 space-y-1">
                  <p className="text-xs font-semibold text-teal-700">
                    {importResult.created} professeur(s) importé(s) avec succès.
                  </p>
                  {importResult.errors.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {importResult.errors.map((err, i) => (
                        <li key={i} className="text-xs text-rose-600">
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={closeImport}>
                  Fermer
                </Button>
                <Button type="submit" disabled={importing || !importFile}>
                  {importing ? 'Import en cours…' : 'Importer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
