import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [members,  setMembers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', members: [] })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const fetchAll = async () => {
    try {
      const [projRes, memRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users/members'),
      ])
      setProjects(projRes.data)
      setMembers(memRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(id)
        ? f.members.filter(m => m !== id)
        : [...f.members, id],
    }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Project name is required')
    setSaving(true); setError('')
    try {
      await api.post('/projects', form)
      setShowModal(false)
      setForm({ name: '', description: '', members: [] })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this project and all its tasks?')) return
    try {
      await api.delete(`/projects/${id}`)
      setProjects(p => p.filter(pr => pr._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Projects 📁</h2>
          <p className="text-gray-400 mt-1 text-sm">{projects.length} active projects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-semibold text-gray-300 text-lg">No projects yet</p>
          <p className="text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map(p => (
            <div
              key={p._id}
              className="card hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer animate-fadeUp"
              onClick={() => navigate(`/projects/${p._id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                <button
                  className="text-gray-600 hover:text-red-400 transition-colors text-lg ml-2"
                  onClick={(e) => handleDelete(p._id, e)}
                  title="Delete project"
                >🗑</button>
              </div>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                {p.description || 'No description provided'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {p.members.slice(0, 4).map(m => (
                    <div key={m._id}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold border-2 border-gray-900"
                      title={m.name}>
                      {m.name?.charAt(0)}
                    </div>
                  ))}
                  {p.members.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs border-2 border-gray-900">
                      +{p.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg animate-fadeUp">
            <h3 className="text-xl font-bold mb-6">New Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Project Name *</label>
                <input className="input" placeholder="E.g. Mobile App Redesign"
                  value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea className="input resize-none" rows={3} placeholder="What's this project about?"
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Add Members</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {members.length === 0 && <p className="text-gray-500 text-sm">No members found. Create member accounts first.</p>}
                  {members.map(m => (
                    <label key={m._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
                      <input type="checkbox" className="accent-indigo-500 w-4 h-4"
                        checked={form.members.includes(m._id)}
                        onChange={() => toggleMember(m._id)} />
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                        {m.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">⚠️ {error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
