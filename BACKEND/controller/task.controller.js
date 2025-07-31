const db = require("../config/db.config");
const Task = db.tasks;
const User = db.users;
const Op = db.Sequelize.Op;

// CREATE USER
exports.create = async (req, res) => {
   
    const {title , description , created_by , status } = req.body
    try {
      // CHECK THE BODY OF REQ. IS NULL OR NOT
      
      if (!req.body) {
        return res.status(400).send({ message: "Content can not be empty!" });
      }
  
      // CREATE A PROJECT OBJECT.
      const task = {
        title: title,
        description: description,
        created_by : created_by,
        status: status ? status : false
      };
  
      // FETCH USER WITH PROJECT ARRIBUTE.
      const users = await User.findAll({ include: Task });
  
      const user = users.find((obj) => obj.name === task.created_by);

      // UPDATE THE USER UPDATE ATTRIBUTE 
      const result = await User.update({ status: task.status }, { where: { id: user.id } });
      if(result) console.log("User 'Status' column has been updated!")

      // CREATE A PROJECT INSTANCE.
      const newTask = await Task.create(task);
      
       // SET THE PROJECT INSTANCE WITH FOREIGN KEY BASED ON USER'ID
      if (user) {
        await user.setTasks(newTask);
      }
  
      res.status(200).send(newTask);
      
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Project.",
      });
    }

}
  
// RETRIEVE ALL PROJECTS FROM THE DATABASE.
exports.findAll = async (req, res) => {
  try {
    const task_title = req.query.title;
    
    const condition = task_title ? { task_title: { [Op.like]: `%${task_title}%` } } : null;

    const data = await Task.findAll({ where: condition });

    if (!data || (Array.isArray(data) && data.length === 0)) {
     return res.status(404).json({ message: 'No data found' });
     }

    res.status(200).send(data)

  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Users."
    });
  }
};

// FIND A SINGLE PROJECT WITH A PROJECT_ID.
exports.findOne = async (req, res) => {
  const id = req.params.id;
  
  try {
    
    const data = await Task.findByPk(id);

    if (!data || Array.isArray(data) && data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.status(200).send(data)
    
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Project with project_id=" + id
    });
  }
  
};

// UPDATE A USER BY THE USER_ID IN THE REQUEST.
exports.update = async (req, res) => {

  const id = req.params.id;
  
  try {

    const result = await Task.update(req.body, { where: { id: id } });
    // console.log(result)

    // IF NO ROWS ARE UPDDATED.
    if (result[0] === 0) {
      return res.status(400).json({ message: "Requested content can't be updated" });
    }

    res.status(200).send({ message: "Project was updated successfully!" });
    
  } catch (err) {
    res.status(500).send({
      message: "Error updating project with id=" + id
    });
  }
  
};

// DELETE A USER WITH THE SPECIFIED USER_ID IN THE REQUEST
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    
    await Task.destroy({ where: { id: id } });
    
    res.status(200).send({ message: "Project was deleted successfully!" });
  } catch (err) {
    
    res.status(500).send({
      message: "Could not delete project with id=" + id
    });
  }
};

// DELETE ALL USERS FROM THE DATABASE.
exports.deleteAll = async (req, res) => {
  try {
    
    await Task.destroy({ where: {}, truncate: false });
    
    res.status(200).send({
      message : "All Projects has been deleted Successfully!"
    })
  } catch (err) {
    
    res.status(500).send({
      message: err.message || "Some error occurred while removing all Projects."
    
    });
  }
  
};

// FIND ALL PUBLISHED PROJECTS
exports.findAllUpdated = async (req, res) => {
  const data = await Task.findAll({ where: { status: true } });

  try {
     
    if (!data || Array.isArray(data) && data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }
    
    res.send(data)
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Projects."
    });
  }
};