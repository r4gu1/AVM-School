const mongoose = require('mongoose')

/**
 * Student schema
 * - rollNo: unique identifier for the student (string to allow leading zeros)
 * - name: student's full name
 * - class: textual class/grade (kept as 'class' for compatibility with frontend)
 * - parentContact: 10-digit parent phone number (stored as string)
 * - status: simple Active/Inactive state
 */
const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    parentContact: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^[0-9]{10}$/.test(v),
        message: (props) => `${props.value} is not a valid 10-digit phone number`,
      },
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
)

// Normalize parentContact before saving (strip non-digits just in case)
studentSchema.pre('save', function (next) {
  if (this.parentContact) {
    // keep only digits
    this.parentContact = String(this.parentContact).replace(/\D/g, '').slice(-10)
  }
  next()
})

const Student = mongoose.model('Student', studentSchema)
module.exports = Student
