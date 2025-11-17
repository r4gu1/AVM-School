const express = require('express')
const jwt = require('jsonwebtoken')
const Student = require('../models/Student')

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

/**
 * Simple authentication middleware that verifies a Bearer token and
 * attaches the token payload to req.user. In production, replace
 * with a robust auth solution.
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

// Small helper to centralize error responses
function handleServerError(res, err) {
  console.error(err)
  return res.status(500).json({ message: err.message || 'Internal server error' })
}

// GET all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find().sort({ rollNo: 1 })
    return res.json(students)
  } catch (err) {
    return handleServerError(res, err)
  }
})

// GET single student
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ message: 'Student not found' })
    return res.json(student)
  } catch (err) {
    return handleServerError(res, err)
  }
})

// CREATE student
router.post('/', authenticateToken, async (req, res) => {
  const { rollNo, name, class: className, parentContact, status } = req.body || {}

  if (!rollNo || !name || !className || !parentContact) {
    return res.status(400).json({ message: 'Missing required fields: rollNo, name, class, parentContact' })
  }

  if (!/^[0-9]{10}$/.test(parentContact)) {
    return res.status(400).json({ message: 'Parent contact must be a 10-digit number' })
  }

  try {
    const student = new Student({ rollNo, name, class: className, parentContact, status: status || 'Active' })
    const saved = await student.save()
    return res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Roll number already exists' })
    }
    return handleServerError(res, err)
  }
})

// UPDATE student
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, class: className, parentContact, status } = req.body || {}

  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ message: 'Student not found' })

    if (name) student.name = name
    if (className) student.class = className
    if (parentContact) {
      if (!/^[0-9]{10}$/.test(parentContact)) {
        return res.status(400).json({ message: 'Parent contact must be a 10-digit number' })
      }
      student.parentContact = parentContact
    }
    if (status) student.status = status

    const updated = await student.save()
    return res.json(updated)
  } catch (err) {
    return handleServerError(res, err)
  }
})

// DELETE student
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id)
    if (!student) return res.status(404).json({ message: 'Student not found' })
    return res.json({ message: 'Student deleted' })
  } catch (err) {
    return handleServerError(res, err)
  }
})

module.exports = router
