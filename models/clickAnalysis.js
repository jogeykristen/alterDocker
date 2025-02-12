module.exports = (sequelize, DataTypes) => {
  const ClickAnalysis = sequelize.define("ClickAnalysis", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    short_url_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "ShortUrls", // Adjust based on your actual ShortUrls table
        key: "id",
      },
    },
    clicked_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    device_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    os_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users", // If users exist in your system
        key: "id",
      },
    },
    tableName: "ClickAnalysis", // Ensures table name is not pluralized
    freezeTableName: true,
  });
  return ClickAnalysis;
};

//module.exports = ClickAnalysis;
