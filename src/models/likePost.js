"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LikePost extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // Post.belongsTo(models.User, { foreignKey: "userId", as: "user" });
            // Post.hasMany(models.Attach, {
            //     foreignKey: "postId",
            //     as: "attachs",
            // });
            LikePost.belongsTo(models.Post, {
                foreignKey: "postId",
                as: "likes",
            });
        }
    }
    LikePost.init(
        {
            postId: DataTypes.INTEGER,
            isLiked: DataTypes.BOOLEAN,
            typeReaction: DataTypes.STRING,
            userId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "LikePost",
        }
    );
    return LikePost;
};
