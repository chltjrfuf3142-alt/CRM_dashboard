import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/buyers', label: 'Buyers', icon: '🌐' },
  { to: '/pipeline', label: 'Pipeline', icon: '📋' },
  { to: '/meetings', label: 'Meetings', icon: '📅' },
  { to: '/email', label: 'Email AI', icon: '✉️' },
]

export function Sidebar() {
  return (
    <aside className="w-60 min-h-screen flex flex-col" style={{ backgroundColor: '#0f172a' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Global Buyer</p>
            <p className="text-slate-400 text-xs">CRM Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">포트폴리오 v1.0</p>
      </div>
    </aside>
  )
}
