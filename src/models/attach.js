"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Attach extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Attach.belongsTo(models.Post, {
                foreignKey: "postId",
                as: "attaches",
            });
        }
    }
    Attach.init(
        {
            postId: DataTypes.INTEGER,
            userId: DataTypes.INTEGER,
            type: DataTypes.STRING,
            fileUrl: DataTypes.STRING,
            resolutionX: DataTypes.INTEGER,
            resolutionY: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "Attach",
        }
    );
    return Attach;
};
