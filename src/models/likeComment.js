"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LikeComment extends Model {
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
            LikeComment.belongsTo(models.Comment, {
                foreignKey: "commentId",
                as: "likes",
            });
        }
    }
    LikeComment.init(
        {
            commentId: DataTypes.INTEGER,
            isLiked: DataTypes.BOOLEAN,
            typeReaction: DataTypes.STRING,
            userId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "LikeComment",
        }
    );
    return LikeComment;
};
