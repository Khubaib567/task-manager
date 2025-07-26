const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  due_date: {
    type: String, // Or change to Date if needed
    required: true
  },
  status: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Make it required if every task must belong to a user
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
