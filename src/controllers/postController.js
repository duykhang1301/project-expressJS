import CRUDService from "../services/CRUDService";
import postService from "../services/postService";

const handleCreatePost = async (req, res) => {
    try {
        const result = await CRUDService.createPost(
            req.body,
            req.user,
            req.files
        );
        const { post, userInfo, attaches } = result;
        return res.status(201).json({
            message: "Created",
            data: {
                post: {
                    ...post,
                    attaches,
                },
                user: userInfo,
            },
        });
    } catch (err) {
        return res.status(500).json("Create post fail");
    }
};

const handleGetPost = async (req, res) => {
    try {
        const result = await CRUDService.getPost(req.params.postId, req.user);
        const { post, likeRecords, attaches } = result;
        return res.status(200).json({
            message: "OK",
            data: {
                ...post,
                ...likeRecords,
                attaches,
            },
        });
    } catch (err) {
        return res.status(500).json("No posts in the data");
    }
};

const handleGetPostOfUser = async (req, res) => {
    try {
        const post = await CRUDService.getPostOfUser(req.user);
        return res.status(200).json({
            message: "OK",
            data: post,
        });
    } catch (err) {
        return res.status(500).json("No posts in the data");
    }
};

const handleLikePost = async (req, res) => {
    try {
        const likePost = await postService.likePost(
            req.body,
            req.params.postId,
            req.user
        );
        return res.status(200).json({
            message: "OK",
            data: likePost,
        });
    } catch (err) {
        return res.status(500).json("No posts in the data");
    }
};

const handleUnLikePost = async (req, res) => {
    try {
        const likePost = await postService.unLikePost(
            req.params.postId,
            req.user
        );
        return res.status(200).json({
            message: "Unliked !",
        });
    } catch (err) {
        return res.status(500).json("No posts in the data");
    }
};

const handleCommentPost = async (req, res) => {
    try {
        const comment = await postService.commentPost(
            req.body,
            req.params.postId,
            req.user
        );
        return res.status(200).json({
            message: "Comment successful!",
            data: comment,
        });
    } catch (err) {
        return res.status(500).json("Comment fail !!");
    }
};

const handleGetCommentList = async (req, res) => {
    try {
        const listComments = await postService.getCommentList(
            req.params.postId
        );
        return res.status(200).json({
            message: "OK",
            data: listComments,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json("No comment in the post !!");
    }
};

const handleLikeComment = async (req, res) => {
    try {
        const likeComment = await postService.likeComment(
            req.params.commentId,
            req.body,
            req.user
        );
        return res.status(200).json({
            message: "OK",
            data: likeComment,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json("Like comment failed !!");
    }
};

const handleUnLikeComment = async (req, res) => {
    try {
        const unLikeComment = await postService.unLikeComment(
            req.params.commentId,
            req.user
        );
        return res.status(200).json({
            message: "OK",
            data: unLikeComment,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json("unlike comment failed !!");
    }
};

const handleGetListSuggestPost = async (req, res) => {
    try {
        const listPost = await CRUDService.getListSuggestPosts(
            req.query.page,
            req.user
        );
        return res.status(200).json(listPost);
    } catch (err) {
        console.log(err);
        return res.status(500).json("No post in data !!");
    }
};

module.exports = {
    handleCreatePost,
    handleGetPost,
    handleGetPostOfUser,
    handleLikePost,
    handleUnLikePost,
    handleCommentPost,
    handleGetCommentList,
    handleLikeComment,
    handleUnLikeComment,
    handleGetListSuggestPost,
};
