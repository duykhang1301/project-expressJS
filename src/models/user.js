"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.hasMany(models.Post, { foreignKey: "userId", as: "post" });
            User.hasMany(models.Friend, {
                foreignKey: "userId",
                as: "friends",
            });
            User.hasMany(models.Comment, {
                foreignKey: "userId",
                as: "user",
            });
        }
    }
    User.init(
        {
            email: DataTypes.STRING,
            password: DataTypes.STRING,
            nickName: DataTypes.STRING,
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            avatar: DataTypes.STRING,
            profileCover: DataTypes.STRING,
            address: DataTypes.STRING,
            relationship: DataTypes.STRING,
            bio: DataTypes.STRING,
            friendId: DataTypes.UUID,
        },
        {
            sequelize,
            modelName: "User",
        }
    );
    return User;
};
