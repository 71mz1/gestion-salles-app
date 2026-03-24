import { FileText, Monitor, LaptopMinimal, Printer, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'
import {
  ficheApi,
  pcApi,
  sallesApi,
  type ApiPc,
  type ApiSalle,
  type FichePc,
  type FicheSalle,
} from '../services/api'

type Tab = 'pc' | 'salle'

const etatLabel: Record<string, string> = {
  fonctionnel: 'Fonctionnel',
  en_panne: 'En panne',
  en_maintenance: 'En maintenance',
}

const etatColor: Record<string, string> = {
  fonctionnel: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  en_panne: 'text-rose-700 bg-rose-50 border-rose-200',
  en_maintenance: 'text-amber-700 bg-amber-50 border-amber-200',
}

const statutColor: Record<string, string> = {
  en_attente: 'text-amber-700 bg-amber-50 border-amber-200',
  en_cours: 'text-sky-700 bg-sky-50 border-sky-200',
  resolue: 'text-emerald-700 bg-emerald-50 border-emerald-200',
}

const statutLabel: Record<string, string> = {
  en_attente: 'En attente',
  en_cours: 'En cours',
  resolue: 'Résolue',
}

// ---------------------------------------------------------------------------
// HTML generators for popup print window (no Tailwind dependency)
// ---------------------------------------------------------------------------

function css(): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; font-size: 13px; color: #1e293b; padding: 32px 40px; }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .meta { font-size: 11px; color: #64748b; margin-bottom: 28px; }
    .section { margin-bottom: 24px; }
    .section-title {
      font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
      color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;
    }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 8px; }
    .field-label { font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; }
    .field-value { font-size: 13px; color: #1e293b; }
    .badge {
      display: inline-block; border-radius: 4px; border: 1px solid; padding: 1px 6px;
      font-size: 10px; font-weight: 700;
    }
    .badge-ok { color: #047857; background: #ecfdf5; border-color: #a7f3d0; }
    .badge-panne { color: #b91c1c; background: #fff1f2; border-color: #fecaca; }
    .badge-maint { color: #b45309; background: #fffbeb; border-color: #fde68a; }
    .badge-attente { color: #b45309; background: #fffbeb; border-color: #fde68a; }
    .badge-cours { color: #0369a1; background: #f0f9ff; border-color: #bae6fd; }
    .badge-resolue { color: #047857; background: #ecfdf5; border-color: #a7f3d0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #64748b; background: #f8fafc; padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; border-radius: 6px; padding: 2px 10px; font-size: 11px; font-weight: 500; }
    .empty { color: #94a3b8; font-size: 12px; font-style: italic; }
    @media print { body { padding: 16px 24px; } }
  `
}

function wrap(title: string, meta: string, body: string): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title><style>${css()}</style></head><body>
    <h1>${title}</h1><p class="meta">${meta}</p>${body}
  </body></html>`
}

function etatBadge(etat: string): string {
  const cls = etat === 'fonctionnel' ? 'ok' : etat === 'en_panne' ? 'panne' : 'maint'
  const label = etatLabel[etat] ?? etat
  return `<span class="badge badge-${cls}">${label}</span>`
}

function statutBadge(statue: string): string {
  const cls = statue === 'resolue' ? 'resolue' : statue === 'en_cours' ? 'cours' : 'attente'
  const label = statutLabel[statue] ?? statue
  return `<span class="badge badge-${cls}">${label}</span>`
}

function field(label: string, value: string): string {
  return `<div><div class="field-label">${label}</div><div class="field-value">${value || '—'}</div></div>`
}

function section(title: string, content: string): string {
  return `<div class="section"><div class="section-title">${title}</div>${content}</div>`
}

function buildFichePcHtml(f: FichePc): string {
  const infoGrid = `<div class="grid">
    ${field('Numéro de poste', f.num_poste)}
    ${field('Processeur', f.processeur ?? '')}
    ${field('RAM', f.ram ?? '')}
    ${field('Disque dur', f.disque_dur ?? '')}
    ${field("Système d'exploitation", f.systeme_exploitation ?? '')}
    ${field('État actuel', etatBadge(f.etat))}
  </div>`

  const salleHtml = f.salle
    ? `<div class="grid">${field('Nom de la salle', f.salle.nom_salle)}${field('Code salle', f.salle.code_salle)}</div>`
    : `<p class="empty">Aucune salle assignée.</p>`

  const affRows = f.affectations.length === 0
    ? `<p class="empty">Aucune affectation enregistrée.</p>`
    : `<table><thead><tr><th>Étudiant</th><th>Niveau</th><th>Date</th><th>Horaire</th></tr></thead><tbody>
        ${f.affectations.map(a => `<tr>
          <td>${a.etudiant ? `${a.etudiant.nom} ${a.etudiant.prenom}` : '—'}</td>
          <td>${a.etudiant?.niveau ? `${a.etudiant.niveau.filiere} · ${a.etudiant.niveau.semestre}` : '—'}</td>
          <td>${a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '—'}</td>
          <td>${a.heure_debut} – ${a.heure_fin}</td>
        </tr>`).join('')}
      </tbody></table>`

  const panneRows = f.pannes.length === 0
    ? `<p class="empty">Aucune panne enregistrée.</p>`
    : `<table><thead><tr><th>Date</th><th>Description</th><th>Statut</th><th>Réparation</th><th>Déclarant</th></tr></thead><tbody>
        ${f.pannes.map(p => `<tr>
          <td>${new Date(p.date_panne).toLocaleDateString('fr-FR')}</td>
          <td>${p.descr_panne}</td>
          <td>${statutBadge(p.statue)}</td>
          <td>${p.descr_reparation ?? '—'}${p.date_reparation ? `<br><small style="color:#94a3b8">${new Date(p.date_reparation).toLocaleDateString('fr-FR')}</small>` : ''}</td>
          <td>${p.professeur ? `${p.professeur.nom} ${p.professeur.prenom}` : '—'}</td>
        </tr>`).join('')}
      </tbody></table>`

  return section('Informations Techniques', infoGrid)
    + section('Salle', salleHtml)
    + section('Binômes affectés', affRows)
    + section('Historique des pannes', panneRows)
}

function buildFicheSalleHtml(f: FicheSalle): string {
  const infoGrid = `<div class="grid">
    ${field('Nom de la salle', f.nom_salle)}
    ${field('Code salle', f.code_salle)}
    ${field('Capacité (étudiants)', String(f.capacite))}
    ${field('Nb postes configurés', String(f.nb_postes))}
    ${field('Postes réels (PCs)', String(f.pcs_count))}
    ${field('Effectif étudiants affectés', String(f.etudiants.length))}
  </div>`

  const niveauxHtml = f.niveaux.length === 0
    ? `<p class="empty">Aucun niveau enregistré.</p>`
    : `<div class="tags">${f.niveaux.map(n => `<span class="tag">${n}</span>`).join('')}</div>`

  const etudiantsRows = f.etudiants.length === 0
    ? `<p class="empty">Aucun étudiant affecté.</p>`
    : `<table><thead><tr><th>Nom</th><th>Prénom</th><th>Niveau</th></tr></thead><tbody>
        ${f.etudiants.map(e => `<tr>
          <td><strong>${e.nom}</strong></td>
          <td>${e.prenom}</td>
          <td>${e.niveau ? `${e.niveau.filiere} · ${e.niveau.semestre}` : '—'}</td>
        </tr>`).join('')}
      </tbody></table>`

  const horairesRows = f.horaires.length === 0
    ? `<p class="empty">Aucun horaire enregistré.</p>`
    : `<table><thead><tr><th>Poste</th><th>Étudiant</th><th>Date</th><th>Horaire</th></tr></thead><tbody>
        ${f.horaires.map(h => `<tr>
          <td><code>${h.num_poste}</code></td>
          <td>${h.etudiant ? `${h.etudiant.nom} ${h.etudiant.prenom}` : '—'}</td>
          <td>${h.date ? new Date(h.date).toLocaleDateString('fr-FR') : '—'}</td>
          <td>${h.heure_debut} – ${h.heure_fin}</td>
        </tr>`).join('')}
      </tbody></table>`

  return section('Informations Salle', infoGrid)
    + section('Niveaux des étudiants', niveauxHtml)
    + section(`Effectif étudiants (${f.etudiants.length})`, etudiantsRows)
    + section("Horaires d'occupation", horairesRows)
}

// ---------------------------------------------------------------------------
// UI components
// ---------------------------------------------------------------------------

function InlineBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold', className)}>
      {children}
    </span>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <span className="text-sm text-slate-800">{value || '—'}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-3">
      {children}
    </h4>
  )
}

function FichePcView({ fiche }: { fiche: FichePc }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionTitle>Informations Techniques</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Numéro de poste" value={fiche.num_poste} />
          <Field label="Processeur" value={fiche.processeur} />
          <Field label="RAM" value={fiche.ram} />
          <Field label="Disque dur" value={fiche.disque_dur} />
          <Field label="Système d'exploitation" value={fiche.systeme_exploitation} />
          <Field label="État actuel" value={<InlineBadge className={etatColor[fiche.etat]}>{etatLabel[fiche.etat] ?? fiche.etat}</InlineBadge>} />
        </div>
      </div>

      <div>
        <SectionTitle>Salle</SectionTitle>
        {fiche.salle ? (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom de la salle" value={fiche.salle.nom_salle} />
            <Field label="Code salle" value={fiche.salle.code_salle} />
          </div>
        ) : (
          <p className="text-sm text-slate-400">Aucune salle assignée.</p>
        )}
      </div>

      <div>
        <SectionTitle>Binômes affectés</SectionTitle>
        {fiche.affectations.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune affectation enregistrée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Étudiant</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Niveau</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Horaire</th>
              </tr>
            </thead>
            <tbody>
              {fiche.affectations.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 text-slate-800">{a.etudiant ? `${a.etudiant.nom} ${a.etudiant.prenom}` : '—'}</td>
                  <td className="px-3 py-2 text-slate-600 text-xs">{a.etudiant?.niveau ? `${a.etudiant.niveau.filiere} · ${a.etudiant.niveau.semestre}` : '—'}</td>
                  <td className="px-3 py-2 text-slate-600 text-xs">{a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-3 py-2 text-slate-600 text-xs">{a.heure_debut} – {a.heure_fin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <SectionTitle>Historique des pannes</SectionTitle>
        {fiche.pannes.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune panne enregistrée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Description</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Statut</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Réparation</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Déclarant</th>
              </tr>
            </thead>
            <tbody>
              {fiche.pannes.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 text-slate-600 text-xs">{new Date(p.date_panne).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-2 text-slate-800">{p.descr_panne}</td>
                  <td className="px-3 py-2"><InlineBadge className={statutColor[p.statue]}>{statutLabel[p.statue] ?? p.statue}</InlineBadge></td>
                  <td className="px-3 py-2 text-slate-600 text-xs">
                    {p.descr_reparation || '—'}
                    {p.date_reparation && <span className="block text-slate-400">{new Date(p.date_reparation).toLocaleDateString('fr-FR')}</span>}
                  </td>
                  <td className="px-3 py-2 text-slate-600 text-xs">{p.professeur ? `${p.professeur.nom} ${p.professeur.prenom}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function FicheSalleView({ fiche }: { fiche: FicheSalle }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionTitle>Informations Salle</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Nom de la salle" value={fiche.nom_salle} />
          <Field label="Code salle" value={fiche.code_salle} />
          <Field label="Capacité (étudiants)" value={fiche.capacite} />
          <Field label="Nb postes configurés" value={fiche.nb_postes} />
          <Field label="Postes réels (PCs)" value={fiche.pcs_count} />
          <Field label="Effectif étudiants affectés" value={fiche.etudiants.length} />
        </div>
      </div>

      <div>
        <SectionTitle>Niveaux des étudiants</SectionTitle>
        {fiche.niveaux.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun niveau enregistré.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fiche.niveaux.map((n) => (
              <span key={n} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">{n}</span>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionTitle>Effectif étudiants ({fiche.etudiants.length})</SectionTitle>
        {fiche.etudiants.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun étudiant affecté.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Nom</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Prénom</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Niveau</th>
              </tr>
            </thead>
            <tbody>
              {fiche.etudiants.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-semibold text-slate-800">{e.nom}</td>
                  <td className="px-3 py-2 text-slate-600">{e.prenom}</td>
                  <td className="px-3 py-2 text-slate-600 text-xs">{e.niveau ? `${e.niveau.filiere} · ${e.niveau.semestre}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <SectionTitle>Horaires d'occupation</SectionTitle>
        {fiche.horaires.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun horaire enregistré.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Poste</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Étudiant</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Horaire</th>
              </tr>
            </thead>
            <tbody>
              {fiche.horaires.map((h) => (
                <tr key={h.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">{h.num_poste}</td>
                  <td className="px-3 py-2 text-slate-800">{h.etudiant ? `${h.etudiant.nom} ${h.etudiant.prenom}` : '—'}</td>
                  <td className="px-3 py-2 text-slate-600 text-xs">{h.date ? new Date(h.date).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-3 py-2 text-slate-600 text-xs">{h.heure_debut} – {h.heure_fin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function FichesPage() {
  const [tab, setTab] = useState<Tab>('pc')
  const [pcs, setPcs] = useState<ApiPc[]>([])
  const [salles, setSalles] = useState<ApiSalle[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [selectedPcId, setSelectedPcId] = useState<number | null>(null)
  const [selectedSalleId, setSelectedSalleId] = useState<number | null>(null)
  const [fichePc, setFichePc] = useState<FichePc | null>(null)
  const [ficheSalle, setFicheSalle] = useState<FicheSalle | null>(null)
  const [loadingFiche, setLoadingFiche] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([pcApi.list(), sallesApi.list()])
      .then(([pcsData, sallesData]) => {
        setPcs(pcsData)
        setSalles(sallesData)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoadingList(false))
  }, [])

  async function loadFichePc(id: number) {
    setSelectedPcId(id)
    setFichePc(null)
    setError(null)
    setLoadingFiche(true)
    try {
      setFichePc(await ficheApi.pc(id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement')
    } finally {
      setLoadingFiche(false)
    }
  }

  async function loadFicheSalle(id: number) {
    setSelectedSalleId(id)
    setFicheSalle(null)
    setError(null)
    setLoadingFiche(true)
    try {
      setFicheSalle(await ficheApi.salle(id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement')
    } finally {
      setLoadingFiche(false)
    }
  }

  function handlePrint() {
    if (tab === 'pc' && fichePc) {
      const title = `Fiche PC — ${fichePc.num_poste}`
      const meta = fichePc.salle
        ? `${fichePc.salle.nom_salle} (${fichePc.salle.code_salle}) · Généré le ${new Date().toLocaleDateString('fr-FR')}`
        : `Généré le ${new Date().toLocaleDateString('fr-FR')}`
      openPrint(title, wrap(title, meta, buildFichePcHtml(fichePc)))
    } else if (tab === 'salle' && ficheSalle) {
      const title = `Fiche Salle — ${ficheSalle.nom_salle}`
      const meta = `Code : ${ficheSalle.code_salle} · Généré le ${new Date().toLocaleDateString('fr-FR')}`
      openPrint(title, wrap(title, meta, buildFicheSalleHtml(ficheSalle)))
    }
  }

  function openPrint(title: string, html: string) {
    const win = window.open('', '_blank', 'width=960,height=720')
    if (!win) return
    win.document.open()
    win.document.write(html)
    win.document.close()
    win.document.title = title
    win.addEventListener('load', () => { win.focus(); win.print() })
  }

  const hasFiche = tab === 'pc' ? !!fichePc : !!ficheSalle

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="route-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Fiches techniques</h2>
          <p className="text-xs text-slate-500">
            Sélectionnez un PC ou une salle pour générer la fiche correspondante
          </p>
        </div>
        {hasFiche && (
          <Button size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Imprimer / PDF
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
        {([
          { key: 'pc', label: 'Fiche PC', icon: Monitor },
          { key: 'salle', label: 'Fiche Salle', icon: LaptopMinimal },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
              tab === key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Selector panel */}
        <div className="route-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {tab === 'pc' ? `${pcs.length} postes` : `${salles.length} salles`}
            </p>
          </div>
          {loadingList ? (
            <div className="p-6 text-center text-sm text-slate-400">Chargement…</div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {tab === 'pc' && pcs.map((pc) => (
                <button
                  key={pc.id}
                  onClick={() => loadFichePc(pc.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50',
                    selectedPcId === pc.id && 'bg-teal-50 border-l-2 border-teal-500',
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    <Monitor className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{pc.num_poste}</p>
                    <p className="text-xs text-slate-500 truncate">{pc.salle?.nom_salle ?? 'Sans salle'}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold', etatColor[pc.etat])}>
                    {etatLabel[pc.etat]}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                </button>
              ))}
              {tab === 'salle' && salles.map((salle) => (
                <button
                  key={salle.id}
                  onClick={() => loadFicheSalle(salle.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50',
                    selectedSalleId === salle.id && 'bg-teal-50 border-l-2 border-teal-500',
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    <LaptopMinimal className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{salle.nom_salle}</p>
                    <p className="text-xs text-slate-500">{salle.code_salle} · {salle.pcs_count} postes</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                </button>
              ))}
              {tab === 'pc' && pcs.length === 0 && <div className="p-6 text-center text-sm text-slate-400">Aucun poste.</div>}
              {tab === 'salle' && salles.length === 0 && <div className="p-6 text-center text-sm text-slate-400">Aucune salle.</div>}
            </div>
          )}
        </div>

        {/* Fiche panel */}
        <div className="route-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          {loadingFiche ? (
            <div className="p-10 text-center text-sm text-slate-400">Chargement de la fiche…</div>
          ) : !hasFiche ? (
            <div className="flex flex-col items-center justify-center gap-3 p-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">
                Sélectionnez un {tab === 'pc' ? 'poste' : 'salle'} pour afficher la fiche
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {tab === 'pc' && fichePc
                      ? `Fiche PC — ${fichePc.num_poste}`
                      : ficheSalle
                        ? `Fiche Salle — ${ficheSalle.nom_salle}`
                        : ''}
                  </h3>
                  <p className="text-xs text-slate-500">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={handlePrint}>
                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                  Imprimer
                </Button>
              </div>

              {tab === 'pc' && fichePc && <FichePcView fiche={fichePc} />}
              {tab === 'salle' && ficheSalle && <FicheSalleView fiche={ficheSalle} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
