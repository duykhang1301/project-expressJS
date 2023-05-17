"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Post.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            Post.hasMany(models.Attach, {
                foreignKey: "postId",
                as: "attachs",
            });
            Post.hasOne(models.LikePost, { foreignKey: "postId", as: "likes" });
        }
    }
    Post.init(
        {
            description: DataTypes.TEXT,
            viewMode: DataTypes.STRING,
            likesCount: DataTypes.INTEGER,
            commentsCount: DataTypes.INTEGER,
            sharesCount: DataTypes.INTEGER,
            allows: DataTypes.STRING,
            status: DataTypes.STRING,
            userId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "Post",
        }
    );
    return Post;
};
