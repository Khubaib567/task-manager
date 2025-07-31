module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("task", {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
      type: DataTypes.STRING,
      allowNull: false
      },
      created_by: {
      type: DataTypes.STRING,
      allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
      createdAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
      
      },
     updatedAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    }
  })
    
    return Task;
  };
  
  
   