const db = require("../database");
const Task = require('../model/task.model')
const User = db.users;
const Op = db.Sequelize.Op;

// CREATE USER
exports.create = async (req, res) => {
   
    const { title, description, due_date, status, userId } = req.body;

  try {
    // Check if request body has content
    if (!title || !description || !due_date || !userId) {
      return res.status(400).json({ message: "Required fields are missing!" });
    }

    // Create the task object
    const taskData = {
      title,
      description,
      due_date,
      status: status ?? false,
      userId
    };

    // Ensure the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create the task instance
    const newTask = await Task.create(taskData);

    // Push the new task _id into the user's tasks array
    user.tasks.push(newTask._id);
    await user.save();

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the Task."
    });
  }
}
  
// RETRIEVE ALL PROJECTS FROM THE DATABASE.
exports.findAll = async (req, res) => {
try {
    const { title } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build regex condition for case-insensitive title match
    const condition = title
      ? { title: { $regex: title, $options: 'i' } }
      : {};

    // Total matching tasks
    const totalTasks = await Task.countDocuments(condition);

    // Paginated + filtered data
    const data = await Task.find(condition)
      .skip(skip)
      .limit(limit);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.status(200).json({
      tasks: data,
      pagination: {
        totalItems: totalTasks,
        currentPage: page,
        totalPages: Math.ceil(totalTasks / limit),
        limit
      }
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving Tasks."
    });
  }
};


// FIND A SINGLE PROJECT WITH A PROJECT_ID.
exports.findOne = async (req, res) => {
 const id = req.params.id;

  try {
    const data = await Task.findById(id); // Mongoose equivalent of findByPk

    if (!data) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving Task with task_id=" + id
    });
  }
  
};

// UPDATE A USER BY THE USER_ID IN THE REQUEST.
exports.update = async (req, res) => {

 const id = req.params.id;

  try {
    const result = await Task.updateOne({ _id: id }, req.body);

    // If no documents were modified
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Requested content can't be updated" });
    }

    res.status(200).json({ message: "Task was updated successfully!" });
  } catch (err) {
    res.status(500).json({
      message: "Error updating task with id=" + id
    });
  }
  
};

// DELETE A USER WITH THE SPECIFIED USER_ID IN THE REQUEST
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Task not found with id=" + id });
    }

    res.status(200).json({ message: "Task was deleted successfully!" });
  } catch (err) {
    res.status(500).json({
      message: "Could not delete task with id=" + id
    });
  }
};

// DELETE ALL USERS FROM THE DATABASE.
exports.deleteAll = async (req, res) => {
  try {
    await Task.deleteMany({}); // Deletes all project documents

    res.status(200).json({
      message: "All Tasks have been deleted successfully!"
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while removing all Projects."
    });
  }
  
};

