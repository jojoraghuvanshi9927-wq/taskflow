import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'member'] },
  { to: '/projects',  label: 'Projects',  icon: '📁', roles: ['admin'] },
  { to: '/tasks',     label: 'My Tasks',  icon: '📋', roles: ['admin', 'member'] },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-xl font-extrabold tracking-tight">
            Task<span className="text-indigo-400">Flow</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">Team Task Manager</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems
            .filter(n => n.roles.includes(user?.role))
            .map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-400 pl-[10px]'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                  }`
                }
              >
                <span>{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all duration-150 font-medium"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-950">
        {children}
      </main>
    </div>
  )
}
