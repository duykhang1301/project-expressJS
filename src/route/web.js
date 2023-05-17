import express from "express";
import homeController from "../controllers/homeController";
import authController from "../controllers/authController";
import userController from "../controllers/userController";
import postController from "../controllers/postController";
import middlewareController from "../middleware/middlewareController";
import path from "path";
import multer from "multer";
let router = express.Router();

const appRoot = require("app-root-path");
//! Use of Multer
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, appRoot + "/src/public/attachs/"); // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const storageAvt = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, appRoot + "/src/public/avatars/"); // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const storageProfileCover = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, appRoot + "/src/public/profileCovers/"); // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

let upload = multer({ storage: storage });

let upLoadAvt = multer({ storage: storageAvt });

let upLoadProfileCover = multer({ storage: storageProfileCover });

const initWebRoutes = (app) => {
    router.get("/", homeController.getHomePage);

    //Auth
    //Register
    router.post("/api/v1/auth/register", authController.register);

    //Login
    router.post("/api/v1/auth/login", authController.login);

    //refreshToken
    router.post("/api/v1/auth/refreshToken", authController.handleRefreshToken);

    //Logout
    router.post(
        "/api/v1/auth/logout",
        middlewareController.verifyToken,
        authController.logout
    );

    //Update profile
    router.post(
        "/api/v1/auth/me",
        middlewareController.verifyToken,
        upLoadAvt.single("avatar"),
        userController.handleUpdateProfile
    );

    //Update profile cover
    router.post(
        "/api/v1/auth/me/profilecover",
        middlewareController.verifyToken,
        upLoadProfileCover.single("profileCover"),
        userController.handleUpdateProfileCover
    );

    //User

    //Get suggested list
    router.get(
        "/api/v1/user/suggested",
        middlewareController.verifyToken,
        userController.handleGetSuggestUsers
    );

    //Get a user
    router.get(
        "/api/v1/user/:nickName",
        middlewareController.verifyToken,
        userController.handleGetAnUser
    );

    //Add friend
    router.post(
        "/api/v1/user/:friendId/friend",
        middlewareController.verifyToken,
        userController.handleAddFriend
    );

    //Unfriend
    router.post(
        "/api/v1/user/:friendId/unfriend",
        middlewareController.verifyToken,
        userController.handleUnFriend
    );

    //Search users

    router.get(
        "/api/user/search",
        middlewareController.verifyToken,
        userController.handleSearchUsers
    );

    //Post

    //Create post
    router.post(
        "/api/v1/posts",
        middlewareController.verifyToken,
        upload.array("attachs"),
        postController.handleCreatePost
    );

    //Get a post
    router.get(
        "/api/v1/posts/:postId",
        middlewareController.verifyToken,
        postController.handleGetPost
    );

    //Get suggested post
    router.get(
        "/api/v1/posts",
        middlewareController.verifyToken,
        postController.handleGetListSuggestPost
    );

    //Get my post
    router.get(
        "/api/v1/users/me/posts",
        middlewareController.verifyToken,
        postController.handleGetPostOfUser
    );

    //Like post
    router.post(
        "/api/v1/posts/:postId/like",
        middlewareController.verifyToken,
        postController.handleLikePost
    );

    //Unlike post
    router.post(
        "/api/v1/posts/:postId/unlike",
        middlewareController.verifyToken,
        postController.handleUnLikePost
    );

    //Comment post
    router.post(
        "/api/v1/posts/:postId/comments",
        middlewareController.verifyToken,
        postController.handleCommentPost
    );

    //Get comment list of the post
    router.get(
        "/api/v1/posts/:postId/comments",
        middlewareController.verifyToken,
        postController.handleGetCommentList
    );

    //Like comment
    router.post(
        "/api/v1/posts/comments/:commentId/like",
        middlewareController.verifyToken,
        postController.handleLikeComment
    );

    //Unlike comment
    router.post(
        "/api/v1/posts/comments/:commentId/unlike",
        middlewareController.verifyToken,
        postController.handleUnLikeComment
    );

    return app.use("/", router);
};

module.exports = initWebRoutes;
