import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

const priorityBadge = (p) => {
  const cls = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }
  return <span className={cls[p] || 'badge-pending'}>{p}</span>
}
const statusBadge = (task) => {
  const now = new Date()
  if (task.status !== 'completed' && new Date(task.dueDate) < now) return <span className="badge-overdue">Overdue</span>
  if (task.status === 'completed')   return <span className="badge-completed">Completed</span>
  if (task.status === 'in-progress') return <span className="badge-in-progress">In Progress</span>
  return <span className="badge-pending">Pending</span>
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project,  setProject]  = useState(null)
  const [tasks,    setTasks]    = useState([])
  const [members,  setMembers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTask,  setEditTask]  = useState(null)
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', status: 'pending', priority: 'medium', dueDate: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ])
      setProject(projRes.data)
      setTasks(tasksRes.data)
      setMembers(projRes.data.members)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  const openNew = () => {
    setEditTask(null)
    setForm({ title: '', description: '', assignedTo: members[0]?._id || '', status: 'pending', priority: 'medium', dueDate: '' })
    setError(''); setShowModal(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({
      title: task.title, description: task.description || '',
      assignedTo: task.assignedTo?._id, status: task.status,
      priority: task.priority, dueDate: task.dueDate?.split('T')[0],
    })
    setError(''); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.assignedTo || !form.dueDate) return setError('Title, Assignee and Due Date are required')
    setSaving(true); setError('')
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, { ...form, project: id })
      } else {
        await api.post('/tasks', { ...form, project: id })
      }
      setShowModal(false); fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks(t => t.filter(tt => tt._id !== taskId))
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
  if (!project) return <div className="p-8 text-red-400">Project not found.</div>

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/projects')} className="text-gray-500 hover:text-gray-300 transition-colors text-sm">← Projects</button>
      </div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{project.name}</h2>
          <p className="text-gray-400 mt-1 text-sm">{project.description || 'No description'}</p>
          <div className="flex items-center gap-2 mt-3">
            {members.map(m => (
              <div key={m._id} className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-xs font-medium">
                <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">{m.name?.charAt(0)}</div>
                {m.name}
              </div>
            ))}
          </div>
        </div>
        <button className="btn-primary" onClick={openNew}>+ New Task</button>
      </div>

      {/* Tasks Table */}
      <div className="card">
        <h3 className="text-lg font-bold mb-5">Tasks ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-semibold text-gray-400">No tasks yet</p>
            <p className="text-sm mt-1">Create the first task for this project</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="text-left pb-3 font-semibold">Title</th>
                  <th className="text-left pb-3 font-semibold">Assignee</th>
                  <th className="text-left pb-3 font-semibold">Priority</th>
                  <th className="text-left pb-3 font-semibold">Due Date</th>
                  <th className="text-left pb-3 font-semibold">Status</th>
                  <th className="text-left pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {tasks.map(task => (
                  <tr key={task._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3">
                      <p className="font-semibold text-gray-200">{task.title}</p>
                      {task.description && <p className="text-gray-500 text-xs mt-0.5">{task.description}</p>}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                          {task.assignedTo?.name?.charAt(0)}
                        </div>
                        <span className="text-gray-400 text-xs">{task.assignedTo?.name}</span>
                      </div>
                    </td>
                    <td className="py-3">{priorityBadge(task.priority)}</td>
                    <td className="py-3 text-gray-400 font-mono text-xs">{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td className="py-3">{statusBadge(task)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="text-gray-500 hover:text-indigo-400 transition-colors" onClick={() => openEdit(task)}>✏️</button>
                        <button className="text-gray-500 hover:text-red-400 transition-colors" onClick={() => handleDelete(task._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg animate-fadeUp max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">{editTask ? 'Edit Task' : 'New Task'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Title *</label>
                <input className="input" placeholder="Task title" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea className="input resize-none" rows={2} placeholder="Short description"
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Assignee *</label>
                  <select className="input" value={form.assignedTo} onChange={e => setForm(f => ({...f, assignedTo: e.target.value}))}>
                    <option value="">Select member</option>
                    {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Due Date *</label>
                  <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">⚠️ {error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving...' : 'Save Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
