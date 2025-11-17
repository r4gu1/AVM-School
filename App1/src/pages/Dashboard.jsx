import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [message, setMessage] = useState('Loading...')
  const [activeTab, setActiveTab] = useState('overview')
  const [showStudentMenu, setShowStudentMenu] = useState(false)
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('name')
  const [formData, setFormData] = useState({
    rollNo: '',
    name: '',
    class: '',
    parentContact: '',
    status: 'Active',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Fetch protected message and students
  useEffect(() => {
    fetchProtected()
    if (activeTab === 'students-view' || activeTab === 'students-edit') {
      fetchStudents()
    }
  }, [activeTab])

  async function fetchProtected() {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/protected', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage(res.data.message)
    } catch (err) {
      localStorage.removeItem('token')
      navigate('/')
    }
  }

  async function fetchStudents() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStudents(res.data)
      setFilteredStudents(res.data)
      setSearchQuery('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() {
    if (!searchQuery.trim()) {
      setFilteredStudents(students)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const results = students.filter((student) => {
      if (searchType === 'name') return student.name.toLowerCase().includes(query)
      if (searchType === 'rollNo') return student.rollNo.toLowerCase().includes(query)
      if (searchType === 'class') return student.class.toLowerCase().includes(query)
      if (searchType === 'contact') return student.parentContact.includes(query)
      return false
    })
    setFilteredStudents(results)
  }

  function handleClearSearch() {
    setSearchQuery('')
    setFilteredStudents(students)
  }

  async function handleSave() {
    if (!formData.rollNo || !formData.name || !formData.class || !formData.parentContact) {
      setError('All fields are required')
      return
    }

    if (!/^[0-9]{10}$/.test(formData.parentContact)) {
      setError('Parent contact must be a 10-digit number')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (editingId) {
        // Update
        await axios.put(`/api/students/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        // Create
        await axios.post('/api/students', formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
      setShowModal(false)
      setFormData({ rollNo: '', name: '', class: '', parentContact: '', status: 'Active' })
      setEditingId(null)
      fetchStudents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this student?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchStudents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student')
    }
  }

  function handleEdit(student) {
    setFormData({
      rollNo: student.rollNo,
      name: student.name,
      class: student.class,
      parentContact: student.parentContact,
      status: student.status,
    })
    setEditingId(student._id)
    setShowModal(true)
  }

  function handleNewStudent() {
    setFormData({ rollNo: '', name: '', class: '', parentContact: '', status: 'Active' })
    setEditingId(null)
    setShowModal(true)
  }

  function logout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="dashboard-container">
      {/* Side Navbar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-sidebar">AVM School</div>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab('overview')}
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Overview</span>
          </button>

          {/* Students with Dropdown */}
          <div 
            className="nav-item-group"
            onMouseEnter={() => setShowStudentMenu(true)}
            onMouseLeave={() => setShowStudentMenu(false)}
          >
            <button
              className={`nav-item ${activeTab.includes('students') ? 'active' : ''}`}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-label">Students</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showStudentMenu && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    setActiveTab('students-view')
                    setShowStudentMenu(false)
                  }}
                  className="dropdown-item"
                >
                     View
                </button>
                <button
                  onClick={() => {
                    setActiveTab('students-edit')
                    setShowStudentMenu(false)
                  }}
                  className="dropdown-item"
                >
                   Edit
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Title Card */}
        <div className="title-card">
          <div className="title-card-content">
            <h1 className="title-card-heading">Welcome to Student Information Portal</h1>
            <p className="title-card-text">
              Manage your school information, students, and more in one place. {message}
            </p>
          </div>
          <div className="title-card-badge">Admin Dashboard</div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2 className="tab-heading">Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{students.length}</div>
                  <div className="stat-label">Total Students</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">12</div>
                  <div className="stat-label">Classes</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">18</div>
                  <div className="stat-label">Teachers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">92%</div>
                  <div className="stat-label">Attendance</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students-view' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-heading"> View Students</h2>
                <button onClick={handleNewStudent} className="btn-add-student">
                  ➕ Add Student
                </button>
              </div>
              <p className="tab-description">
                Browse all student records with their details and current status.
              </p>

              {/* Search Section */}
              <div className="search-section">
                <div className="search-controls">
                  <input
                    type="text"
                    placeholder="Enter search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="search-select"
                  >
                    <option value="name">Search by Name</option>
                    <option value="rollNo">Search by Roll No</option>
                    <option value="class">Search by Class</option>
                    <option value="contact">Search by Contact</option>
                  </select>
                  <button onClick={handleSearch} className="btn-search">
                    Search
                  </button>
                  <button onClick={handleClearSearch} className="btn-clear">
                    ✕ Clear
                  </button>
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              {loading ? (
                <div className="loading">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="placeholder-box">
                  <p>No students found. Click "Add Student" to create one.</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="placeholder-box">
                  <p>No matching students found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="students-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Parent Contact</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td>{student.rollNo}</td>
                          <td>{student.name}</td>
                          <td>{student.class}</td>
                          <td>{student.parentContact}</td>
                          <td>
                            <span className={`status-badge ${student.status.toLowerCase()}`}>
                              {student.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleEdit(student)}
                              className="action-btn edit-btn"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="action-btn delete-btn"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'students-edit' && (
            <div className="tab-content">
              <h2 className="tab-heading"> Manage Students</h2>
              <p className="tab-description">
                Add, update, or remove student information and records.
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              <button onClick={handleNewStudent} className="btn-add-student">
                ➕ Add New Student
              </button>

              {loading ? (
                <div className="loading">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="placeholder-box">
                  <p>No students found. Click "Add New Student" to create one.</p>
                </div>
              ) : (
                <div className="students-list">
                  {students.map((student) => (
                    <div key={student._id} className="student-card">
                      <div className="student-info">
                        <h3>{student.name}</h3>
                        <p><strong>Roll No:</strong> {student.rollNo}</p>
                        <p><strong>Class:</strong> {student.class}</p>
                        <p><strong>Parent Contact:</strong> {student.parentContact}</p>
                        <p>
                          <strong>Status:</strong> 
                          <span className={`status-badge ${student.status.toLowerCase()}`}>
                            {student.status}
                          </span>
                        </p>
                      </div>
                      <div className="student-actions">
                        <button
                          onClick={() => handleEdit(student)}
                          className="btn-action btn-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="btn-action btn-delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="Enter roll number"
                  disabled={editingId !== null}
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter student name"
                />
              </div>
              <div className="form-group">
                <label>Class</label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                >
                  <option value="">Select Class</option>
                  <option value="10-A">10-A</option>
                  <option value="10-B">10-B</option>
                  <option value="11-A">11-A</option>
                  <option value="11-B">11-B</option>
                  <option value="12-A">12-A</option>
                  <option value="12-B">12-B</option>
                </select>
              </div>
              <div className="form-group">
                <label>Parent Contact (10 digits)</label>
                <input
                  type="text"
                  value={formData.parentContact}
                  onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                  placeholder="Enter 10-digit contact number"
                  maxLength="10"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-save">
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
