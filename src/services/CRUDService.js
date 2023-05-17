import bcrypt from "bcryptjs";
import db from "../models/index";
import { v4 as uuidv4 } from "uuid";
const salt = bcrypt.genSaltSync(10);

const ffprobePath = "./ffmpeg/bin/ffprobe.exe";
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfprobePath(ffprobePath);

const createUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashedPassword = await hashedUserPassword(data.password);
            const user = await db.User.create({
                email: data.email,
                password: hashedPassword,
                nickName: data.email.split("@")[0],
                firstName: data.firstName ?? "",
                lastName: data.lastName ?? "",
                avatar: data.avatar ?? "",
                friendId: uuidv4(),
            });
            const { password, ...others } = user.dataValues;
            resolve(others);
        } catch (e) {
            reject(e);
        }
    });
};

const hashedUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const hashedPassword = await bcrypt.hashSync(password, salt);
            resolve(hashedPassword);
        } catch (e) {
            reject(e);
        }
    });
};

const userLogin = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await db.User.findOne({
                where: { email: data.email },
            });
            resolve(user);
        } catch (err) {
            reject(err);
        }
    });
};

const getAllUsers = (data, me) => {
    const page = +data.page;
    const pageSize = +data.per_page;
    const offset = (+data.page - 1) * pageSize;
    const limit = pageSize;
    return new Promise(async (resolve, reject) => {
        try {
            const { count, rows } = await db.User.findAndCountAll({
                offset,
                limit,
                attributes: {
                    exclude: ["password"],
                },
                raw: true,
                nest: true,
            });
            const isFriends = await db.Friend.findAll({
                where: { userId: me.id },
                raw: false,
                nest: true,
            });
            const findAndCountFriend = async () => {
                const friendWithMe = rows.map(async (user) => {
                    const friendsCount = await db.Friend.count({
                        where: { friendId: user.friendId },
                    });
                    const listFriend = isFriends.find(
                        (friend) => friend.friendId === user.friendId
                    );
                    return (user = {
                        ...user,
                        friendsCount: friendsCount ?? 0,
                        isFriend: listFriend?.isFriend ?? false,
                    });
                });
                const result = Promise.all(friendWithMe);
                return result;
            };
            const friendWithMe = await findAndCountFriend();
            const data = {
                data: friendWithMe,
                meta: {
                    total: count,
                    totalPages: Math.ceil(count / pageSize),
                    currentPage: page,
                },
            };
            resolve(data);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const getUser = (nickName, me) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rawUser = await db.User.findOne({
                where: { nickName: nickName.split("@")[1] },
                attributes: {
                    exclude: ["password"],
                },
            });

            const isFriend = await db.Friend.findOne({
                where: {
                    userId: me.id,
                    friendId: rawUser.friendId,
                },
                attributes: {
                    include: ["isFriend"],
                },
                raw: false,
                nest: true,
            });

            const friendsCount = await db.Friend.count({
                where: { friendId: rawUser.friendId },
            });

            const allPosts = await db.Post.findAll({
                where: { userId: rawUser.id },
                nest: true,
            });

            const attaches = await db.Attach.findAll({
                where: { userId: rawUser.id },
                nest: true,
            });

            const postData = allPosts.map((post) => {
                const attachOfPost = attaches.filter(
                    (attach) => attach.postId === post.id
                );
                return (post = { ...post, attaches: attachOfPost });
            });
            const user = {
                ...rawUser,
                friendsCount: friendsCount ?? 0,
                isFriend: isFriend?.dataValues?.isFriend ?? false,
            };
            resolve({
                user,
                postData,
            });
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
};

const handleVideo = (videoPath) => {
    return new Promise((resolve, reject) => {
        try {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    console.error(err);
                } else {
                    const { width, height } = metadata.streams[0].coded_width
                        ? metadata.streams[0]
                        : metadata.streams[1];
                    resolve({ width, height });
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

const createPost = (data, user, files) => {
    return new Promise(async (resolve, reject) => {
        let attaches = [];
        try {
            const post = await db.Post.create({
                description: data.description,
                viewMode: data.viewMode,
                allows: data.allows,
                likesCount: 0,
                commentsCount: 0,
                sharesCount: 0,
                userId: user.id,
            });
            for (let index = 0; index < files.length; index++) {
                const url = `${process.env.SERVER_URL}/attachs/${files[index].filename}`;
                const type = files[index].mimetype;
                const resolution = await handleVideo(url);
                const attach = await db.Attach.create({
                    postId: post.id,
                    userId: user.id,
                    type: type,
                    fileUrl: url,
                    resolutionX: resolution.width,
                    resolutionY: resolution.height,
                });
                attaches.push(attach.dataValues);
            }

            const userInfo = await db.User.findOne({
                where: { id: user.id },
                attributes: {
                    exclude: ["password"],
                },
            });
            const { dataValues } = post;
            resolve({ post: dataValues, userInfo, attaches });
        } catch (err) {
            reject(err);
        }
    });
};

const getPost = (postId, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const post = await db.Post.findOne({
                where: { id: postId },
                include: [
                    {
                        model: db.User,
                        as: "user",
                        attributes: { exclude: ["password"] },
                        include: [
                            {
                                model: db.Friend,
                                as: "friends",
                                attributes: ["isFriend"],
                            },
                        ],
                    },
                ],
                raw: true,
                nest: true,
            });

            const likeRecord = await db.LikePost.findOne({
                where: { postId, userId: user.id },
                attributes: ["isLiked", "typeReaction"],
                raw: false,
                nest: true,
            });

            const likesCount = await db.LikePost.count({
                where: { postId: postId },
                nest: true,
            });

            const commentsCount = await db.Comment.count({
                where: { postId: postId },
                nest: true,
            });

            const attaches = await db.Attach.findAll({
                where: { postId: postId },
                nest: true,
            });

            const checkDataUndefined = likeRecord?.dataValues ?? {
                isLiked: false,
                typeReaction: null,
            };

            const likeRecords = {
                ...checkDataUndefined,
                likesCount,
            };

            resolve({
                post,
                likeRecords,
                commentsCount,
                attaches,
            });
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const getListSuggestPosts = (page, user) => {
    const pageSize = 20;
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    return new Promise(async (resolve, reject) => {
        try {
            const { count, rows } = await db.Post.findAndCountAll({
                offset,
                limit,
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

            const attaches = await db.Attach.findAll();
            const likes = await db.LikePost.findAll({
                raw: false,
                nest: true,
            });
            const processItems = async () => {
                const listPost = rows.map(async (post, index) => {
                    const friendsCount = await db.Friend.count({
                        where: { friendId: post.user.friendId },
                    });

                    const friendWithMe = await db.Friend.findOne({
                        where: {
                            userId: user.id,
                            friendId: post.user.friendId,
                        },
                        raw: false,
                        nest: true,
                    });

                    const commentsCount = await db.Comment.count({
                        where: { postId: post.id },
                    });
                    const likesCount = await db.LikePost.count({
                        where: { postId: post.id },
                    });
                    const listAttaches = attaches.filter(
                        (attach) => attach.postId === post.id
                    );
                    const listLiked = likes.filter(
                        (like) =>
                            like.postId === post.id &&
                            like.userId === post.user.id
                    );
                    const { isLiked, typeReaction } = listLiked[index] ?? {
                        isLiked: false,
                        typeReaction: null,
                    };
                    const userInfo = {
                        ...post.user,
                        friendsCount: friendsCount ?? 0,
                        isFriend: friendWithMe?.isFriend ?? false,
                    };
                    return (post = {
                        ...post,
                        user: userInfo,
                        isLiked,
                        typeReaction,
                        commentsCount,
                        likesCount,
                        attachs: listAttaches,
                    });
                });
                const results = await Promise.all(listPost);
                return results;
            };
            const listPost = await processItems();
            const checkMyPost = listPost.filter(
                (post) => post.user.id !== user.id
            );
            const data = {
                data: checkMyPost,
                meta: {
                    total: count,
                    totalPages: Math.ceil(count / pageSize),
                    currentPage: page,
                },
            };
            resolve(data);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const getPostOfUser = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const posts = await db.Post.findAll({
                where: { userId: user.id },
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

            const attaches = await db.Attach.findAll({
                where: { userId: user.id },
                nest: true,
            });

            const data = posts.map((item) => {
                const attachesOfPost = attaches.filter(
                    (attach) => attach.postId === item.id
                );
                return (item = { ...item, attaches: attachesOfPost });
            });

            resolve(data);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = {
    createUser,
    userLogin,
    getAllUsers,
    getUser,
    createPost,
    getPost,
    getPostOfUser,
    getListSuggestPosts,
};
