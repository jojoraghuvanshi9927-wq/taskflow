import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login       from './pages/Login'
import Signup      from './pages/Signup'
import Dashboard   from './pages/Dashboard'
import Projects    from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Tasks       from './pages/Tasks'
import Layout      from './components/common/Layout'

const PrivateRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login"  element={<PublicRoute><Login  /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/projects"  element={<PrivateRoute adminOnly><Layout><Projects /></Layout></PrivateRoute>} />
      <Route path="/projects/:id" element={<PrivateRoute adminOnly><Layout><ProjectDetail /></Layout></PrivateRoute>} />
      <Route path="/tasks"     element={<PrivateRoute><Layout><Tasks /></Layout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
