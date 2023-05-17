import db from "../models/index";
const fs = require("fs");
const appRoot = require("app-root-path");
const Sequelize = require("sequelize");

const addFriend = (friendId, me) => {
    return new Promise(async (resolve, reject) => {
        try {
            const friend = await db.Friend.create({
                userId: me.id,
                isFriend: true,
                friendId: friendId,
            });
            const user = await db.User.findOne({
                where: { friendId },
                attributes: { exclude: ["password"] },
            });
            const { isFriend } = friend;
            resolve({ ...user, isFriend });
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const unFriend = (friendId, me) => {
    return new Promise(async (resolve, reject) => {
        try {
            const friend = await db.Friend.destroy({
                where: { userId: me.id, friendId },
            });
            const user = await db.User.findOne({
                where: { id: me.id },
                attributes: { exclude: ["password"] },
            });
            resolve({ ...user, isFriend: false });
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const handleUnlinkFile = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
            console.error("Error removing file:", err);
            return;
        }

        console.log("File removed successfully!");
    });
};

const updateProfile = (data, user, file) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { avatar } = await db.User.findOne({
                where: { id: user.id },
            });
            if (avatar) {
                handleUnlinkFile(
                    appRoot + "/src/public/avatars/" + avatar.split("/").pop()
                );
            }

            const url = `${process.env.SERVER_URL}/avatars/${file.filename}`;
            await db.User.update(
                {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    avatar: url,
                    address: data.address,
                    relationship: data.relationship,
                    bio: data.bio,
                },
                { where: { id: user.id } }
            );
            const profile = await db.User.findOne({
                where: { id: user.id },
                attributes: { exclude: ["password"] },
            });
            resolve(profile);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const updateProfileCover = (user, file) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { profileCover } = await db.User.findOne({
                where: { id: user.id },
            });
            if (profileCover) {
                handleUnlinkFile(
                    appRoot +
                        "/src/public/profileCovers/" +
                        profileCover.split("/").pop()
                );
            }
            const url = `${process.env.SERVER_URL}/profileCovers/${file.filename}`;
            await db.User.update(
                {
                    profileCover: url,
                },
                { where: { id: user.id } }
            );
            const profile = await db.User.findOne({
                where: { id: user.id },
                attributes: { exclude: ["password"] },
            });
            resolve(profile);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};

const searchUsers = (data) => {
    const { q, page, type } = data;
    const pageSize = type === "less" ? 5 : 10;
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    return new Promise(async (resolve, reject) => {
        try {
            const { count, rows } = await db.User.findAndCountAll({
                offset,
                limit,
                where: {
                    email: {
                        [Sequelize.Op.like]: Sequelize.fn("LOWER", `%${q}%`),
                    },
                },
                attributes: {
                    exclude: ["password"],
                },
            });

            const checkFriendWithMe = async () => {
                const listFriendWithMe = rows.map(async (user) => {
                    const friendsCount = await db.Friend.count({
                        where: { friendId: user.friendId },
                    });

                    const friend = await db.Friend.findOne({
                        where: { friendId: user.friendId },
                        raw: false,
                        nest: true,
                    });

                    return (user = {
                        ...user,
                        friendsCount: friendsCount ?? 0,
                        isFriend: friend?.isFriend ?? false,
                    });
                });

                const result = Promise.all(listFriendWithMe);
                return result;
            };

            const userInfo = await checkFriendWithMe();

            const data = {
                data: userInfo,
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

module.exports = {
    addFriend,
    unFriend,
    updateProfile,
    updateProfileCover,
    searchUsers,
};
