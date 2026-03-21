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
import { NiveauxPage } from './pages/NiveauxPage'
import { AuthProvider, useAuth } from './state/auth'
import { ThemeProvider } from './state/theme-context'
import type { UserRole } from './types/auth'

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/connexion" replace />
  return <>{children}</>
}

function RequireRole({ children, allowed }: { children: ReactNode; allowed: UserRole[] }) {
  const { role } = useAuth();
  // إذا لم يكن لديه الحق، نرجعه للصفحة المسموحة له (مثلاً pannes للتقني)
  if (!role || !allowed.includes(role)) {
    return <Navigate to={getHomePath(role)} replace />;
  }
  return <>{children}</>;
}
const getHomePath = (role: UserRole | null) => {
  if (role === 'administrateur') return '/tableau-de-bord';
  if (role === 'technicien' || role === 'professeur') return '/pannes';
  return '/connexion';
};
function AppRoutes() {
const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route
        path="/connexion"
       element={isAuthenticated ? <Navigate to={getHomePath(role)} replace /> : <LoginPage />}
      />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route 
          path="/tableau-de-bord" 
          element={
            <RequireRole allowed={['administrateur']}>
              <DashboardPage />
            </RequireRole>
          } 
        />
        <Route path="/salles" element={
  <RequireRole allowed={['administrateur']}>
    <SallesPage />
  </RequireRole>
} />
      <Route path="/postes" element={
  <RequireRole allowed={['administrateur', 'professeur']}>
    <PostesPage />
  </RequireRole>
} />
        <Route path="/pannes" element={<PannesPage />} />
<Route path="/etudiants" element={
  <RequireRole allowed={['administrateur']}>
    <EtudiantsPage />
  </RequireRole>
} />
        <Route
          path="/niveaux"
          element={
            <RequireRole allowed={['administrateur']}>
              <NiveauxPage />
            </RequireRole>
          }
        />
        <Route
          path="/utilisateurs"
          element={
            <RequireRole allowed={['administrateur']}>
              <UtilisateursPage />
            </RequireRole>
          }
        />
     <Route path="/fiches" element={
  <RequireRole allowed={['administrateur']}>
    <FichesPage />
  </RequireRole>
} />
        <Route path="/parametres" element={<ParametresPage />} />
      </Route>
      <Route
        path="*"
       element={<Navigate to={isAuthenticated ? getHomePath(role) : '/connexion'} replace />}/>
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
