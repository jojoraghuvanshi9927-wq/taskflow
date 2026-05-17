import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const StatCard = ({ icon, label, value, color }) => (
  <div className="card animate-fadeUp">
    <div className="text-2xl mb-3">{icon}</div>
    <div className={`text-4xl font-extrabold font-mono ${color}`}>{value}</div>
    <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
  </div>
)

const statusBadge = (task) => {
  const now = new Date()
  if (task.status !== 'completed' && new Date(task.dueDate) < now)
    return <span className="badge-overdue">Overdue</span>
  if (task.status === 'completed')   return <span className="badge-completed">Completed</span>
  if (task.status === 'in-progress') return <span className="badge-in-progress">In Progress</span>
  return <span className="badge-pending">Pending</span>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats,  setStats]  = useState(null)
  const [tasks,  setTasks]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/tasks/dashboard'),
          api.get('/tasks'),
        ])
        setStats(statsRes.data)
        setTasks(tasksRes.data.slice(0, 6))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight">
          Dashboard 👋
        </h2>
        <p className="text-gray-400 mt-1 text-sm">
          Welcome back, <span className="text-indigo-400 font-semibold">{user?.name}</span>! Here's your overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon="📋" label="Total Tasks"  value={stats?.total      ?? 0} color="text-indigo-400" />
        <StatCard icon="⏳" label="Pending"      value={stats?.pending    ?? 0} color="text-yellow-400" />
        <StatCard icon="🔄" label="In Progress"  value={stats?.inProgress ?? 0} color="text-blue-400"   />
        <StatCard icon="✅" label="Completed"    value={stats?.completed  ?? 0} color="text-green-400"  />
        <StatCard icon="🚨" label="Overdue"      value={stats?.overdue    ?? 0} color="text-red-400"    />
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <h3 className="text-lg font-bold mb-5">Recent Tasks</h3>
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold text-gray-400">No tasks yet</p>
            <p className="text-sm mt-1">Tasks will appear here once created</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="text-left pb-3 font-semibold">Task</th>
                  <th className="text-left pb-3 font-semibold">Project</th>
                  {user.role === 'admin' && <th className="text-left pb-3 font-semibold">Assignee</th>}
                  <th className="text-left pb-3 font-semibold">Due Date</th>
                  <th className="text-left pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {tasks.map(task => (
                  <tr key={task._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 font-semibold text-gray-200">{task.title}</td>
                    <td className="py-3 text-gray-400 font-mono text-xs">{task.project?.name}</td>
                    {user.role === 'admin' && (
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                            {task.assignedTo?.name?.charAt(0)}
                          </div>
                          <span className="text-gray-400">{task.assignedTo?.name}</span>
                        </div>
                      </td>
                    )}
                    <td className="py-3 text-gray-400 font-mono text-xs">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">{statusBadge(task)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
