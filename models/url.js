module.exports = (sequelize, DataTypes) => {
  const Url = sequelize.define(
    "Url",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      long_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      short_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      custom_alias: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      topic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Url", // This ensures Sequelize uses the table name "Url" (singular)
    }
  );

  return Url;
};
