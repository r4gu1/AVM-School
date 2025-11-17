import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/login', { username, password })
      const { token } = res.data
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center login-page">
      <div className="card bg-white shadow-lg rounded-lg p-8 w-full max-w-md">

    <div className="flex items-center justify-center mb-6">
      <div className="logo text-2xl font-bold">AVM School</div>
    </div>

    <h2 className="text-2xl font-bold text-center">Faculty Login portal</h2>
    <p className="text-center text-gray-500 mt-1">
      Sign in to continue to your account
    </p>

    <form onSubmit={submit} className="mt-6">

      {/* Username */}
      <div className="form-field mb-4">
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500"
          placeholder="demo"
        />
      </div>

      {/* Password */}
      <div className="form-field mb-4">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500"
          placeholder="password"
        />
      </div>

      {/* Error message */}
      {error && <div className="error text-red-500 text-sm mb-2">{error}</div>}

      {/* Submit button */}
      <div className="flex items-center justify-center mb-6">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full px-3 py-2 rounded-md bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>

      {/* Links */}
      <div className="mt-4 flex justify-between">
        <a className="text-sm text-violet-600 hover:underline cursor-pointer">
          Forgot password?
        </a>
        <a className="text-sm text-violet-600 hover:underline cursor-pointer">
          Create account
        </a>
      </div>
    </form>

  </div>
</div>


  )
}
