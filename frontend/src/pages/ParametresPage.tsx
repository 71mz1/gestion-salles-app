import {
  Bell,
  Globe,
  KeyRound,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'
import { useAuth } from '../state/auth'
import { accentColors, useTheme, type ThemeMode } from '../state/theme-context'

const roleLabel: Record<string, string> = {
  administrateur: 'Administrateur',
  technicien:     'Technicien',
  professeur:     'Professeur',
}
const roleGrad: Record<string, string> = {
  administrateur: 'from-teal-500 to-cyan-400',
  technicien:     'from-sky-500 to-blue-400',
  professeur:     'from-violet-500 to-purple-400',
}

type Section = 'profil' | 'apparence' | 'notifications' | 'securite' | 'systeme'

const sections: { id: Section; label: string; icon: typeof User }[] = [
  { id: 'profil',        label: 'Profil',        icon: User },
  { id: 'apparence',     label: 'Apparence',     icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'securite',      label: 'Sécurité',      icon: Shield },
  { id: 'systeme',       label: 'Système',        icon: Globe },
]

const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'clair',   label: 'Clair',   icon: Sun },
  { id: 'sombre',  label: 'Sombre',  icon: Moon },
  { id: 'système', label: 'Système', icon: Globe },
]

export function ParametresPage() {
  const { role } = useAuth()
  const { theme, setTheme, accent, setAccent } = useTheme()

  const [active, setActive]       = useState<Section>('profil')
  const [saved, setSaved]         = useState(false)
  const [nom, setNom]             = useState(roleLabel[role ?? ''] ?? '')
  const [email, setEmail]         = useState('admin@encgo.ma')
  const [lang, setLang]           = useState('Français')
  const [notifPanne, setNotifPanne]     = useState(true)
  const [notifEmail, setNotifEmail]     = useState(false)
  const [notifSonore, setNotifSonore]   = useState(true)
  const [currentPwd, setCurrentPwd]     = useState('')
  const [newPwd, setNewPwd]             = useState('')
  const [confirmPwd, setConfirmPwd]     = useState('')

  const grad = roleGrad[role ?? ''] ?? 'from-teal-500 to-cyan-400'

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Paramètres</h2>
          <p className="text-xs text-slate-500">Gérez vos préférences et la configuration du système</p>
        </div>
        <Button size="sm" onClick={handleSave}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {saved ? 'Enregistré !' : 'Enregistrer'}
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Sidebar tabs */}
        <div className="route-card w-52 shrink-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm self-start">
          <div className="mb-3 flex flex-col items-center gap-1.5 py-3 border-b border-slate-100">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-md', grad)}>
              {role?.[0]?.toUpperCase()}
            </div>
            <p className="text-xs font-semibold text-slate-800">{roleLabel[role ?? '']}</p>
            <p className="text-[10px] text-slate-400">ENCGO · Oujda</p>
          </div>
          <nav className="space-y-0.5">
            {sections.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                    active === s.id
                      ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-100'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5 shrink-0', active === s.id ? 'text-teal-600' : 'text-slate-400')} />
                  {s.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="route-card flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* Profil */}
          {active === 'profil' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Informations du profil</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Nom complet</label>
                  <Input value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Rôle</label>
                  <Input value={roleLabel[role ?? ''] ?? ''} disabled className="opacity-60 cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Établissement</label>
                  <Input value="ENCGO · Oujda" disabled className="opacity-60 cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {/* Apparence */}
          {active === 'apparence' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Apparence</h3>

              {/* Theme */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Thème de l'interface</p>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((t) => {
                    const Icon = t.icon
                    const active = theme === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all',
                          active
                            ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                        )}
                      >
                        <Icon className={cn('h-5 w-5', active ? 'text-teal-600' : 'text-slate-400')} />
                        {t.label}
                        {active && <span className="text-[10px] text-teal-500 font-semibold">Actif</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Accent */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Couleur d'accentuation</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(accentColors).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setAccent(key)}
                      title={val.label}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-medium transition-all',
                        accent === key
                          ? 'border-slate-800 bg-slate-50 text-slate-800 shadow-sm'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300',
                      )}
                    >
                      <span className={cn('h-4 w-4 rounded-full', val.tw)} />
                      {val.label}
                      {accent === key && <span className="text-[10px] text-slate-400">✓</span>}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400">La couleur s'applique immédiatement à toute l'interface.</p>
              </div>
            </div>
          )}

          {/* Notifications */}
          {active === 'notifications' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Préférences de notifications</h3>
              <div className="space-y-3">
                {[
                  { label: 'Alertes pannes',      sub: 'Être notifié quand un poste passe en panne',     val: notifPanne,  set: setNotifPanne },
                  { label: 'Notifications email',  sub: 'Recevoir un email pour chaque incident déclaré', val: notifEmail,  set: setNotifEmail },
                  { label: 'Son de notification',  sub: 'Jouer un son lors de nouvelles alertes',         val: notifSonore, set: setNotifSonore },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{n.label}</p>
                      <p className="text-xs text-slate-500">{n.sub}</p>
                    </div>
                    <button
                      onClick={() => n.set(!n.val)}
                      className={cn(
                        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                        n.val ? 'bg-teal-500' : 'bg-slate-200',
                      )}
                    >
                      <span className={cn(
                        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200',
                        n.val ? 'translate-x-4' : 'translate-x-0',
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sécurité */}
          {active === 'securite' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Changer le mot de passe</h3>
              <div className="space-y-3 max-w-sm">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Mot de passe actuel</label>
                  <Input type="password" placeholder="••••••••" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Nouveau mot de passe</label>
                  <Input type="password" placeholder="••••••••" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Confirmer le mot de passe</label>
                  <Input type="password" placeholder="••••••••" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
                </div>
                {newPwd && confirmPwd && newPwd !== confirmPwd && (
                  <p className="text-xs text-rose-600">Les mots de passe ne correspondent pas.</p>
                )}
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-600">Règles de sécurité</p>
                </div>
                {['Minimum 8 caractères', 'Au moins une majuscule', 'Au moins un chiffre'].map((r) => (
                  <p key={r} className="text-xs text-slate-500 pl-5">· {r}</p>
                ))}
              </div>
            </div>
          )}

          {/* Système */}
          {active === 'systeme' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Configuration système</h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Langue de l'interface</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="h-9 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors"
                >
                  <option>Français</option>
                  <option>العربية</option>
                  <option>English</option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Version',          value: '1.0.0' },
                  { label: 'Environnement',    value: 'Production' },
                  { label: 'Base de données',  value: 'PostgreSQL 15' },
                  { label: 'Dernière MAJ',     value: '2026-03-08' },
                ].map((i) => (
                  <div key={i.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{i.label}</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-800">{i.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
