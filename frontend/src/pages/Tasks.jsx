import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const statusOptions = ['pending', 'in-progress', 'completed']
const statusColors  = { pending: 'badge-pending', 'in-progress': 'badge-in-progress', completed: 'badge-completed' }
const priorityColors = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }

export default function Tasks() {
  const { user } = useAuth()
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [updating, setUpdating] = useState(null)

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks')
      setTasks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleStatusUpdate = async (taskId, newStatus) => {
    setUpdating(taskId)
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus })
      setTasks(prev => prev.map(t => t._id === taskId ? data : t))
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(null)
    }
  }

  const now = new Date()
  const filtered = tasks.filter(t => {
    const matchStatus = filter === 'all' ? true
      : filter === 'overdue' ? (t.status !== 'completed' && new Date(t.dueDate) < now)
      : t.status === filter
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.project?.name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight">
          {user.role === 'admin' ? 'All Tasks 📋' : 'My Tasks 📋'}
        </h2>
        <p className="text-gray-400 mt-1 text-sm">{filtered.length} tasks found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="input max-w-xs"
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'in-progress', 'completed', 'overdue'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-150 ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-semibold text-gray-300 text-lg">No tasks found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < now
            return (
              <div key={task._id}
                className={`card flex items-start md:items-center gap-4 flex-col md:flex-row animate-fadeUp transition-all ${
                  isOverdue ? 'border-red-500/30' : ''
                }`}>
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className={`font-bold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                      {task.title}
                    </h3>
                    {isOverdue && <span className="badge-overdue">Overdue</span>}
                  </div>
                  {task.description && <p className="text-gray-500 text-sm mb-2">{task.description}</p>}
                  <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500 font-mono">
                    <span>📁 {task.project?.name}</span>
                    {user.role === 'admin' && <span>👤 {task.assignedTo?.name}</span>}
                    <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={priorityColors[task.priority]}>{task.priority}</span>

                  {/* Status Dropdown */}
                  <select
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer transition-all ${statusColors[task.status]} bg-transparent`}
                    value={task.status}
                    disabled={updating === task._id}
                    onChange={e => handleStatusUpdate(task._id, e.target.value)}
                    style={{ appearance: 'auto' }}
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s} className="bg-gray-900 text-gray-100">
                        {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>

                  {updating === task._id && (
                    <span className="text-xs text-gray-500">Saving...</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
