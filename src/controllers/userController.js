import CRUDService from "../services/CRUDService";
import userService from "../services/userService";

const handleGetSuggestUsers = async (req, res) => {
    try {
        const users = await CRUDService.getAllUsers(req.query, req.user);
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json("No users in the data");
    }
};

const handleGetAnUser = async (req, res) => {
    try {
        const result = await CRUDService.getUser(req.params.nickName, req.user);
        const { user, postData, isFriend } = result;
        return res.status(200).json({
            message: "OK",
            data: {
                ...user,
                ...isFriend,
                posts: postData,
            },
        });
    } catch (err) {
        return res.status(500).json("No users in the data");
    }
};

const handleAddFriend = async (req, res) => {
    try {
        const friend = await userService.addFriend(
            req.params.friendId,
            req.user
        );
        return res.status(200).json({
            message: "OK",
            data: friend,
        });
    } catch (err) {
        return res.status(500).json("No users in the data");
    }
};

const handleUnFriend = async (req, res) => {
    try {
        const friend = await userService.unFriend(
            req.params.friendId,
            req.user
        );
        return res.status(200).json({
            message: "Unfriend with this user successful",
            data: friend,
        });
    } catch (err) {
        return res.status(500).json("No users in the data");
    }
};

const handleUpdateProfile = async (req, res) => {
    try {
        const user = await userService.updateProfile(
            req.body,
            req.user,
            req.file
        );
        return res.status(200).json({
            data: user,
        });
    } catch (err) {
        console.log(err);
        return res.status(403).json("Update failed");
    }
};

const handleUpdateProfileCover = async (req, res) => {
    try {
        const user = await userService.updateProfileCover(req.user, req.file);
        return res.status(200).json({
            data: user,
        });
    } catch (err) {
        console.log(err);
        return res.status(403).json("Update failed");
    }
};

const handleSearchUsers = async (req, res) => {
    try {
        const listUsers = await userService.searchUsers(req.query);
        return res.status(200).json(listUsers);
    } catch (err) {
        console.log(err);
        return res.status(500).json("No user in data");
    }
};

module.exports = {
    handleGetSuggestUsers,
    handleGetAnUser,
    handleAddFriend,
    handleUnFriend,
    handleUpdateProfile,
    handleUpdateProfileCover,
    handleSearchUsers,
};
