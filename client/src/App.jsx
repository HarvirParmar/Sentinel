
import { useState } from 'react'
import './App.css'

const API = 'http://localhost:5000/api'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [registering, setRegistering] = useState(false)
  const [incidents, setIncidents] = useState([])
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Phishing',
    severity: 'Medium'
  })

  const request = async (path, method = 'GET', body = null) => {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }

    return data
  }

  const login = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setToken(data.token)
      setUser(data.user)
      setMessage('Welcome to Sentinel')
      loadIncidents(data.token)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const register = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setMessage('Account created. You can now sign in.')
      setRegistering(false)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const loadIncidents = async (currentToken = token) => {
    try {
      const response = await fetch(`${API}/incidents`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setIncidents(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const createIncident = async (e) => {
    e.preventDefault()
    try {
      await request('/incidents', 'POST', form)
      setForm({
        title: '',
        description: '',
        category: 'Phishing',
        severity: 'Medium'
      })
      setMessage('Security incident reported successfully.')
      loadIncidents()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const updateIncident = async (id, status) => {
    try {
      await request(`/incidents/${id}`, 'PUT', { status })
      setMessage('Incident status updated.')
      loadIncidents()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const deleteIncident = async (id) => {
    if (!window.confirm('Delete this incident?')) return
    try {
      await request(`/incidents/${id}`, 'DELETE')
      setMessage('Incident deleted.')
      loadIncidents()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const logout = () => {
    setUser(null)
    setToken('')
    setIncidents([])
    setEmail('')
    setPassword('')
    setMessage('You have signed out.')
  }

  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="brand-mark">S</div>
          <h1>SENTINEL</h1>
          <p className="subtitle">Security Incident Management System</p>
          <h2>{registering ? 'Create Account' : 'Welcome Back'}</h2>

          <form onSubmit={registering ? register : login}>
            {registering && (
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              required
            />
            <button type="submit">
              {registering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="switch-auth">
            {registering ? 'Already registered?' : 'New to Sentinel?'}
            <button onClick={() => setRegistering(!registering)}>
              {registering ? 'Sign In' : 'Create Account'}
            </button>
          </p>
          {message && <p className="message">{message}</p>}
        </div>
      </main>
    )
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="side-brand">
          <span>S</span>
          <h2>SENTINEL</h2>
        </div>
        <p className="side-label">MAIN MENU</p>
        <a className="active" href="#dashboard">Dashboard</a>
        <a href="#report">Report Incident</a>
        <a href="#incidents">Incidents</a>
        <div className="side-user">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
          <button onClick={logout}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p>SECURITY OPERATIONS</p>
            <h1>Security Dashboard</h1>
          </div>
          <span className="role-tag">{user.role.toUpperCase()}</span>
        </header>

        {message && <p className="message dashboard-message">{message}</p>}

        <section className="stats">
          <div className="stat-card">
            <span>Total Incidents</span>
            <strong>{incidents.length}</strong>
          </div>
          <div className="stat-card">
            <span>Open Incidents</span>
            <strong>{incidents.filter(i => i.status === 'Open').length}</strong>
          </div>
          <div className="stat-card">
            <span>Under Investigation</span>
            <strong>{incidents.filter(i => i.status === 'Under Investigation').length}</strong>
          </div>
          <div className="stat-card">
            <span>Resolved</span>
            <strong>{incidents.filter(i => i.status === 'Resolved').length}</strong>
          </div>
        </section>

        <section className="panel" id="report">
          <h2>Report a Security Incident</h2>
          <form className="incident-form" onSubmit={createIncident}>
            <input
              placeholder="Incident title"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
            >
              <option>Phishing</option>
              <option>Unauthorized Access</option>
              <option>Malware</option>
              <option>Suspicious Activity</option>
              <option>Data Exposure</option>
              <option>Other</option>
            </select>
            <select
              value={form.severity}
              onChange={e => setForm({...form, severity: e.target.value})}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
            <textarea
              placeholder="Describe what happened..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              required
            />
            <button type="submit">Submit Incident Report</button>
          </form>
        </section>

        <section className="panel" id="incidents">
          <div className="panel-heading">
            <h2>Security Incidents</h2>
            <button className="refresh" onClick={() => loadIncidents()}>
              Refresh
            </button>
          </div>

          {incidents.length === 0 ? (
            <p className="empty">No incidents have been reported yet.</p>
          ) : (
            <div className="incident-list">
              {incidents.map(incident => (
                <article className="incident-card" key={incident._id}>
                  <div className="incident-heading">
                    <h3>{incident.title}</h3>
                    <span className={`severity ${incident.severity.toLowerCase()}`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p>{incident.description}</p>
                  <div className="incident-details">
                    <span>{incident.category}</span>
                    <span>Status: {incident.status}</span>
                    <span>Reported by: {incident.reportedBy?.name || 'Unknown'}</span>
                  </div>

                  {user.role === 'admin' && (
                    <div className="admin-actions">
                      <select
                        value={incident.status}
                        onChange={e => updateIncident(incident._id, e.target.value)}
                      >
                        <option>Open</option>
                        <option>Under Investigation</option>
                        <option>Resolved</option>
                      </select>
                      <button
                        className="delete-button"
                        onClick={() => deleteIncident(incident._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
