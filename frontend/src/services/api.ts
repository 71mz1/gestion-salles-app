// هكا React غيجيب الرابط من ملف .env ديال كول واحد فيكم
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

const get = <T>(path: string) => request<T>('GET', path)
const post = <T>(path: string, body: unknown, auth = true) => request<T>('POST', path, body, auth)
const put = <T>(path: string, body: unknown) => request<T>('PUT', path, body)
const del = <T>(path: string) => request<T>('DELETE', path)

async function postForm<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export type UserRole = 'professeur' | 'technicien' | 'administrateur'

export interface ApiUser {
  id: number
  nom: string
  prenom: string
  email: string
  role: UserRole
}

export interface LoginResponse {
  token: string
  type: string
  user: ApiUser
}

// Salles
export interface ApiSalle {
  id: number
  nom_salle: string
  code_salle: string
  capacite: number
  nb_postes: number
  pcs_count: number
  created_at: string
}

// PCs / Postes
export interface ApiPc {
  id: number
  num_poste: string
  salle_id: number
  salle: { id: number; nom_salle: string; code_salle: string } | null
  processeur: string | null
  ram: string | null
  disque_dur: string | null
  systeme_exploitation: string | null
  etat: 'fonctionnel' | 'en_panne' | 'en_maintenance'
  created_at: string
}

// Pannes
export interface ApiPanne {
  id: number
  descr_panne: string
  photo: string | null
  date_panne: string
  statue: 'en_attente' | 'en_cours' | 'resolue'
  descr_reparation: string | null
  date_reparation: string | null
  photo_reparation: string | null
  pc: { id: number; num_poste: string; etat: string; salle: { id: number; code_salle: string; nom_salle: string } | null } | null
  professeur: { id: number; nom: string; prenom: string } | null
  created_at: string
}

// Dashboard
export interface DashboardStats {
  salles: number
  pcs_total: number
  pcs_fonctionnels: number
  pcs_en_panne: number
  pcs_maintenance: number
  pannes_en_attente: number
  pannes_en_cours: number
  pannes_resolues: number
  recent_pannes: Array<{
    id: number
    descr_panne: string
    statue: string
    date_panne: string
    pc: { num_poste: string; code_salle: string | null } | null
  }>
}

// Professeur-specific types
export interface ProfPc {
  id: number
  num_poste: string
  etat: 'fonctionnel' | 'en_panne' | 'en_maintenance'
  salle: { id: number; code_salle: string; nom_salle: string } | null
}

export interface ProfPanne {
  id: number
  descr_panne: string
  date_panne: string
  statue: 'en_attente' | 'en_cours' | 'resolue'
  descr_reparation?: string | null
  date_reparation?: string | null
  pc: {
    id: number
    num_poste: string
    etat: string
    salle: { code_salle: string; nom_salle: string } | null
  } | null
}

// Niveaux
export interface ApiNiveau {
  id: number
  semestre: string
  filiere: string
  created_at?: string
  updated_at?: string
}

// Etudiants
export interface ApiEtudiant {
  id: number
  nom: string
  prenom: string
  niveau: ApiNiveau | null
}

// Affectations
export interface ApiAffectation {
  id: number
  date: string
  heure_debut: string
  heure_fin: string
  pc: { id: number; num_poste: string; salle: { code_salle: string; nom_salle: string } | null } | null
  etudiant: { id: number; nom: string; prenom: string; niveau: ApiNiveau | null } | null
}

export const authApi = {
  login: (email: string, password: string) => post<LoginResponse>('/auth/login', { email, password }, false),
  me: () => get<ApiUser>('/auth/me'),
  logout: () => post<{ message: string }>('/auth/logout', {}),
}

export const dashboardApi = {
  stats: () => get<DashboardStats>('/dashboard/stats'),
}

export const sallesApi = {
  list: () => get<ApiSalle[]>('/salles'),
  create: (data: { nom_salle: string; code_salle: string; capacite: number; nb_postes?: number }) =>
    post<ApiSalle>('/salles', data),
  update: (id: number, data: Partial<{ nom_salle: string; code_salle: string; capacite: number; nb_postes: number }>) =>
    put<ApiSalle>(`/salles/${id}`, data),
  destroy: (id: number) => del<{ message: string }>(`/salles/${id}`),
}

export const pcApi = {
  list: (salle_id?: number) => get<ApiPc[]>(salle_id ? `/pcs?salle_id=${salle_id}` : '/pcs'),
  create: (data: {
    num_poste: string
    salle_id: number
    processeur?: string
    ram?: string
    disque_dur?: string
    systeme_exploitation?: string
    etat?: string
  }) => post<ApiPc>('/pcs', data),
  update: (id: number, data: Partial<ApiPc>) => put<ApiPc>(`/pcs/${id}`, data),
  destroy: (id: number) => del<{ message: string }>(`/pcs/${id}`),
}

export const panneApi = {
  list: (statue?: string) => get<ApiPanne[]>(statue ? `/pannes?statue=${statue}` : '/pannes'),
  create: (data: { descr_panne: string; date_panne: string; pc_id: number; prof_id: number; photo?: string }) =>
    post<ApiPanne>('/pannes', data),
  update: (id: number, data: { statue?: string; descr_reparation?: string; date_reparation?: string; photo_reparation?: string }) =>
    put<ApiPanne>(`/pannes/${id}`, data),
  destroy: (id: number) => del<{ message: string }>(`/pannes/${id}`),
}

export const userApi = {
  list: () => get<ApiUser[]>('/users'),
  create: (data: { nom: string; prenom: string; email: string; password: string; role: string }) =>
    post<ApiUser>('/users', data),
  update: (id: number, data: Partial<{ nom: string; prenom: string; email: string; password: string; role: string }>) =>
    put<ApiUser>(`/users/${id}`, data),
  destroy: (id: number) => del<{ message: string }>(`/users/${id}`),
}

export const professeurApi = {
  pannes: () => get<ProfPanne[]>('/professeur/pannes'),
  declarerPanne: (payload: { pc_id: number; descr_panne: string; date_panne: string; photo?: string }) =>
    post<ProfPanne>('/professeur/pannes', payload),
  pcs: () => get<ProfPc[]>('/professeur/pcs'),
  etatPc: (id: number) => get<ProfPc>(`/professeur/pcs/${id}/etat`),
}

export const niveauApi = {
  list: () => get<ApiNiveau[]>('/niveaux'),
  create: (data: { semestre: string; filiere: string }) => post<ApiNiveau>('/niveaux', data),
  update: (id: number, data: Partial<{ semestre: string; filiere: string }>) =>
    put<ApiNiveau>(`/niveaux/${id}`, data),
  destroy: (id: number) => del<{ message: string }>(`/niveaux/${id}`),
}

export const etudiantApi = {
  list: () => get<ApiEtudiant[]>('/etudiants'),
  create: (data: { nom: string; prenom: string; niveau_id: number }) => post<ApiEtudiant>('/etudiants', data),
  update: (id: number, data: Partial<{ nom: string; prenom: string; niveau_id: number }>) =>
    put<ApiEtudiant>(`/etudiants/${id}`, data),
  destroy: (id: number) => del<{ message: string }>(`/etudiants/${id}`),
  importCsv: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return postForm<{ created: number; errors: string[] }>('/etudiants/import-csv', fd)
  },
}

export const affectationApi = {
  list: () => get<ApiAffectation[]>('/affectations'),
  create: (data: { pc_id: number; etudiant_id: number; date: string; heure_debut: string; heure_fin: string }) =>
    post<ApiAffectation>('/affectations', data),
  destroy: (id: number) => del<{ message: string }>(`/affectations/${id}`),
}
