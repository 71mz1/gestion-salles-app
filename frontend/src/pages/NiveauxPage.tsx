import { Book, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'
import { niveauApi, type ApiNiveau } from '../services/api'

const emptyForm = { semestre: '', filiere: '' }

export function NiveauxPage() {
  const [niveaux, setNiveaux] = useState<ApiNiveau[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<ApiNiveau | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    niveauApi.list()
      .then(setNiveaux)
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

  const filtered = niveaux.filter((n) => {
    const needle = search.toLowerCase()
    return (
      n.semestre.toLowerCase().includes(needle) ||
      n.filiere.toLowerCase().includes(needle)
    )
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.semestre || !form.filiere) return
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        const updated = await niveauApi.update(editing.id, {
          semestre: form.semestre,
          filiere: form.filiere,
        })
        setNiveaux((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
      } else {
        const created = await niveauApi.create({
          semestre: form.semestre,
          filiere: form.filiere,
        })
        setNiveaux((prev) => [...prev, created])
      }
      closeForm()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    setError(null)
    try {
      await niveauApi.destroy(id)
      setNiveaux((prev) => prev.filter((n) => n.id !== id))
      setConfirmDeleteId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpenForm(true)
  }

  function openEdit(niveau: ApiNiveau) {
    setEditing(niveau)
    setForm({
      semestre: niveau.semestre,
      filiere: niveau.filiere,
    })
    setOpenForm(true)
  }

  function closeForm() {
    setOpenForm(false)
    setEditing(null)
    setForm(emptyForm)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Gestion des Niveaux</h2>
          <p className="text-xs text-slate-500">{niveaux.length} niveaux enregistrés</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher un niveau…"
              className="pl-9 h-8 text-xs w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {[
          {
            label: 'Total niveaux',
            value: niveaux.length,
            color: 'text-teal-600',
          },
          {
            label: 'Filières uniques',
            value: filieresCount,
            color: 'text-sky-600',
          },
          {
            label: 'Semestres uniques',
            value: semestresCount,
            color: 'text-violet-600',
          },
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
          <div className="p-8 text-center text-sm text-slate-400">
            Chargement…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Filière
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Semestre
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
                {filtered.map((niveau, i) => (
                  <tr
                    key={niveau.id}
                    className={cn(
                      'transition hover:bg-slate-50',
                      i < filtered.length - 1 && 'border-b border-slate-100',
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 border border-violet-100">
                          <Book className="h-3.5 w-3.5 text-violet-600" />
                        </div>
                        <span className="font-semibold text-slate-800">
                          {niveau.filiere}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{niveau.semestre}</td>
                    <td className="px-5 py-4 text-slate-600 text-xs">
                      {niveau.created_at
                        ? new Date(niveau.created_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {confirmDeleteId === niveau.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-500">
                            Confirmer ?
                          </span>
                          <button
                            onClick={() => handleDelete(niveau.id)}
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
                            onClick={() => openEdit(niveau)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(niveau.id)}
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
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-sm text-slate-400"
                    >
                      Aucun niveau trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {openForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setOpenForm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                {editing ? 'Modifier un niveau' : 'Ajouter un niveau'}
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
                  Filière *
                </label>
                <Input
                  placeholder="ex: Informatique, MIAGE, GRH..."
                  value={form.filiere}
                  onChange={(e) =>
                    setForm({ ...form, filiere: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Semestre *
                </label>
                <Input
                  placeholder="ex: S1, S2, S3, S4..."
                  value={form.semestre}
                  onChange={(e) =>
                    setForm({ ...form, semestre: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeForm}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enregistrement…' : (editing ? 'Enregistrer' : 'Ajouter le niveau')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
