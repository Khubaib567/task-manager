const db = require("../database/");
const User = require('../models/user.model'); // adjust path as needed

const {generateToken,removeToken} = require('../utils/json.token');
const User = db.users;


// CREATE AND SAVE A NEW USER
exports.create = async (req, res) => {

  // Use destructuring to access fields
  const { name, password, email, role, tasks } = req.body;

  try {
    // Basic validation
    if (!name || !password || !email) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    // Construct user object
    const userObj = {
      name,
      password, // Password will be hashed automatically in schema (if implemented)
      email,
      role: role  ?  role : "STUDENT",
      tasks: Array.isArray(tasks) ? tasks : [] // ensure it's an array of task IDs
    };

    // Create user
    const createdUser = await User.create(userObj);

    if (!createdUser) {
      return res.status(500).json({ message: "User creation failed." });
    }

    // Generate token
    const token = await generateToken(res, createdUser._id);

    // Update user with token
    createdUser.token = token;
    const result = await createdUser.save();

    res.status(201).json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message || "Some error occurred while creating the User."
    });
  }
};


// RETRIEVE ALL USERS FROM THE DATABASE.
exports.findAll = async (req, res) => {
  // Extract pagination parameters from query string with defaults
  const page = parseInt(req.query.page) || 1;       // Current page (default: 1)
  const limit = parseInt(req.query.limit) || 10;    // Items per page (default: 10)
  const skip = (page - 1) * limit;

  try {
    // Fetch total user count for metadata
    const totalUsers = await User.countDocuments();

    // Paginated user data
    const data = await User.find()
      .populate('tasks')
      .skip(skip)
      .limit(limit);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.status(200).json({
      users: data,
      pagination: {
        totalItems: totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving Users."
    });
  }
  
};

// FIND A SINGLE USER WITH AN ID
exports.findOne = async (req, res) => {
  
  const id = req.params.id;

  try {
    // Find user by _id and populate tasks
    const data = await User.findById(id).populate('tasks');

    if (!data) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: `Error retrieving User with id=${id}`
    });
  }
};
  
// UPDATE A USER BY THE ID IN THE REQUEST
exports.update = async (req, res) => {

  const id = req.params.id;

  try {
    const result = await User.updateOne({ _id: id }, req.body);

    // Check if any document was modified
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Requested content can't be task" });
    }

    res.status(200).json({ message: "User was task successfully!" });
  } catch (err) {
    res.status(500).json({
      message: "Error updating user with id=" + id
    });
  }
  
};


// DELETE A USER WITH THE SPECIFIED ID IN THE REQUEST
exports.delete = async (req, res) => {

 const id = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: `User not found with id=${id}` });
    }

    await removeToken(req, res); // Custom logout/token clear logic

    res.status(200).json({ message: "User was deleted successfully!" });
  } catch (err) {
    res.status(500).json({
      message: "Could not delete user with id=" + id
    });
  }
 
};


// DELETE ALL USERS FROM THE DATABASE.
exports.deleteAll = async (req, res) => {
   try {
    await User.deleteMany({}); // Deletes all documents in the collection

    res.status(200).json({
      message: "All Users have been deleted successfully!"
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while removing all Users."
    });
  }
  
};



