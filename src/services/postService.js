import db from "../models/index";

const likePost = (data, postId, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const like = await db.LikePost.create({
                postId,
                isLiked: true,
                typeReaction: data.typeReaction,
                userId: user.id,
            });
            resolve(like);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const unLikePost = (postId, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const unLike = await db.LikePost.update(
                { isLiked: false },
                { where: { postId, userId: user.id } }
            );
            resolve(unLike);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const commentPost = (data, postId, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const comment = await db.Comment.create({
                comment: data.comment,
                postId,
                userId: user.id,
            });
            const userComment = await db.User.findOne({
                where: { id: user.id },
                attributes: { exclude: ["password"] },
            });
            resolve({ ...comment.dataValues, user: userComment });
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const getCommentList = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const listComments = await db.Comment.findAll({
                where: { postId },
                include: [
                    {
                        model: db.LikeComment,
                        as: "likes",
                        attributes: ["isLiked", "typeReaction"],
                    },
                    {
                        model: db.User,
                        as: "user",
                        attributes: { exclude: ["password"] },
                    },
                ],
                raw: false,
                nest: true,
            });
            // const likesCount = await db.LikeComment.count()
            // const likeComment = await db.LikeComment.findAll({
            //     where: { postId },
            // });
            resolve(listComments);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const likeComment = (commentId, data, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const comment = await db.Comment.findOne({
                where: { id: commentId },
                include: [
                    {
                        model: db.User,
                        as: "user",
                        attributes: { exclude: ["password"] },
                    },
                ],
                raw: true,
                nest: true,
            });
            if (!comment) {
                throw "No comment in the post";
            }
            const findLikeComment = await db.LikeComment.findOne({
                where: { commentId },
            });
            let result;
            if (findLikeComment) {
                await db.LikeComment.update(
                    { isLiked: true, typeReaction: data.typeReaction },
                    { where: { commentId } }
                );
                result = {
                    isLiked: true,
                    typeReaction: data.typeReaction,
                };
            } else {
                result = await db.LikeComment.create({
                    commentId,
                    isLiked: true,
                    typeReaction: data.typeReaction,
                    userId: user.id,
                });
            }
            const { isLiked, typeReaction } = result;
            const likesCount = await db.LikeComment.count();
            resolve({ ...comment, likesCount, isLiked, typeReaction });
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const unLikeComment = (commentId, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.LikeComment.update(
                { isLiked: false },
                { where: { commentId, userId: user.id } }
            );
            const comment = await db.Comment.findOne({
                where: { id: commentId },
                include: [
                    {
                        model: db.User,
                        as: "user",
                        attributes: { exclude: ["password"] },
                    },
                ],
                raw: true,
                nest: true,
            });
            const likesCount = await db.LikeComment.count();
            const likeComment = await db.LikeComment.findOne({
                where: { commentId, userId: user.id },
                raw: false,
                nest: true,
            });
            const { isLiked, typeReaction } = likeComment;
            resolve({ ...comment, likesCount, isLiked, typeReaction });
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

module.exports = {
    likePost,
    unLikePost,
    commentPost,
    getCommentList,
    likeComment,
    unLikeComment,
};
