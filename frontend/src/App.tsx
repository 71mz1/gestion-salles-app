import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { FichesPage } from './pages/FichesPage'
import { ParametresPage } from './pages/ParametresPage'
import { LoginPage } from './pages/LoginPage'
import { PannesPage } from './pages/PannesPage'
import { PostesPage } from './pages/PostesPage'
import { SallesPage } from './pages/SallesPage'
import { UtilisateursPage } from './pages/UtilisateursPage'
import { EtudiantsPage } from './pages/EtudiantsPage'
import { AuthProvider, useAuth } from './state/auth'
import { ThemeProvider } from './state/theme-context'
import type { UserRole } from './types/auth'

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/connexion" replace />
  return <>{children}</>
}

function RequireRole({ children, allowed }: { children: ReactNode; allowed: UserRole[] }) {
  const { role } = useAuth()
  if (!role || !allowed.includes(role)) return <Navigate to="/tableau-de-bord" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/connexion"
        element={isAuthenticated ? <Navigate to="/tableau-de-bord" replace /> : <LoginPage />}
      />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/tableau-de-bord" element={<DashboardPage />} />
        <Route path="/salles" element={<SallesPage />} />
        <Route path="/postes" element={<PostesPage />} />
        <Route path="/pannes" element={<PannesPage />} />
        <Route path="/etudiants" element={<EtudiantsPage />} />
        <Route
          path="/utilisateurs"
          element={
            <RequireRole allowed={['administrateur']}>
              <UtilisateursPage />
            </RequireRole>
          }
        />
        <Route path="/fiches" element={<FichesPage />} />
        <Route path="/parametres" element={<ParametresPage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/tableau-de-bord' : '/connexion'} replace />}
      />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
