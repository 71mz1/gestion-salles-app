/**
 * Types for Niveau (Academic Level) Management
 * Represents academic levels which are assigned to students
 * Structure: semestre (semester) + filiere (field of study)
 */

export interface Niveau {
  id: number
  semestre: string
  filiere: string
  created_at?: string
  updated_at?: string
}

export interface CreateNiveauInput {
  semestre: string
  filiere: string
}

export interface UpdateNiveauInput {
  semestre?: string
  filiere?: string
}
