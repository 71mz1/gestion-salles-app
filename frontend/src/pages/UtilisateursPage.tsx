import { Eye, EyeOff, Mail, Plus, Search, Shield, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'
import { userApi, type ApiUser } from '../services/api'

const roleLabel: Record<string, string> = {
  administrateur: 'Administrateur',
  technicien:     'Technicien',
  professeur:     'Professeur',
}
const roleStyle: Record<string, string> = {
  administrateur: 'bg-teal-50 text-teal-700 border-teal-200',
  technicien:     'bg-sky-50 text-sky-700 border-sky-200',
  professeur:     'bg-violet-50 text-violet-700 border-violet-200',
}
const avatarStyle: Record<string, string> = {
  administrateur: 'from-teal-500 to-cyan-500',
  technicien:     'from-sky-500 to-blue-500',
  professeur:     'from-violet-500 to-purple-500',
}
const shieldColor: Record<string, string> = {
  administrateur: 'text-teal-500',
  technicien:     'text-sky-500',
  professeur:     'text-violet-500',
}

const emptyForm = { nom: '', prenom: '', email: '', password: '', role: 'professeur' }

export function UtilisateursPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [showPwd, setShowPwd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    userApi.list()
      .then(setUsers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await userApi.create({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        password: form.password,
        role: form.role,
      })
      setUsers((prev) => [...prev, created])
      setForm(emptyForm)
      setShowPwd(false)
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
      await userApi.destroy(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setConfirmDeleteId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setShowPwd(false)
    setForm(emptyForm)
  }

  const byRole = (r: string) => users.filter((u) => u.role === r).length

  const filtered = users.filter(
    (u) =>
      `${u.nom} ${u.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Utilisateurs</h2>
          <p className="text-xs text-slate-500">{users.length} comptes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Rechercher…" className="pl-9 h-8 text-xs w-44" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Ajouter
          </Button>
        </div>
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Administrateurs', role: 'administrateur' },
          { label: 'Techniciens',     role: 'technicien' },
          { label: 'Professeurs',     role: 'professeur' },
        ].map((r) => (
          <div key={r.label} className="route-card rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <Shield className={cn('h-3.5 w-3.5', shieldColor[r.role])} />
              <p className="text-xs text-slate-500">{r.label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{byRole(r.role)}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      {/* User list */}
      <div className="route-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Chargement…</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white', avatarStyle[user.role] ?? 'from-slate-400 to-slate-500')}>
                  {user.nom[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.prenom} {user.nom}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <span className={cn('hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', roleStyle[user.role] ?? '')}>
                  {roleLabel[user.role] ?? user.role}
                </span>
                <Badge variant="success">Actif</Badge>
                {confirmDeleteId === user.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDelete(user.id)}
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
                    onClick={() => setConfirmDeleteId(user.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">Aucun utilisateur trouvé.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={handleClose}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Ajouter un utilisateur</h3>
              <button onClick={handleClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
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
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Email *</label>
                <Input type="email" placeholder="ex: benali@encgo.ma" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Mot de passe *</label>
                <div className="relative">
                  <Input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                >
                  <option value="administrateur">Administrateur</option>
                  <option value="technicien">Technicien</option>
                  <option value="professeur">Professeur</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={handleClose}>Annuler</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Ajouter'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
