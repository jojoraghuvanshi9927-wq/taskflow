import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { signup }  = useAuth()
  const navigate    = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form.name, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4"
         style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #1e1060 0%, #030712 70%)' }}>
      <div className="w-full max-w-md animate-fadeUp">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Task<span className="text-indigo-400">Flow</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Create your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input className="input" placeholder="Jyoti Raghuvanshi" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input className="input" type="email" placeholder="you@team.dev" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Role</label>
              <select className="input" value={form.role} onChange={set('role')}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
