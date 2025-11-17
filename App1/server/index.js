const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

// Built-in body parser (no external body-parser required)
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const MONGODB_URI = process.env.MONGODB_URI

// Demo credentials for the simple demo login endpoint
const DEMO_USER = { username: 'demo', password: 'password', name: 'Demo User' }

/**
 * Minimal authentication middleware for protected routes.
 * On success adds `req.user` with the token payload.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Unauthorized' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

/**
 * Login endpoint - returns a short-lived JWT for the demo user.
 * In production replace with proper user lookup and hashed passwords.
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' })

  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    const token = jwt.sign({ sub: username, name: DEMO_USER.name }, JWT_SECRET, { expiresIn: '1h' })
    return res.json({ token })
  }

  return res.status(401).json({ message: 'Invalid username or password' })
})

// Example protected route using the middleware above
app.get('/api/protected', authenticateToken, (req, res) => {
  return res.json({ message: `Hello ${req.user.name}, this is a protected message.` })
})

// Mount student routes (these routes should perform their own validation)
const studentRoutes = require('./routes/students')
app.use('/api/students', studentRoutes)

/**
 * Start the server after establishing a MongoDB connection.
 * Avoid logging the full MongoDB URI (sensitive). Instead, log success/failure.
 */
async function startServer() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment. Set MONGODB_URI in your .env file.')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  }
}

startServer()

