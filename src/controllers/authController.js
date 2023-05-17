import CRUDService from "../services/CRUDService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index";
require("dotenv").config();

const refreshTokens = [];

const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
};

const register = async (req, res) => {
    let result = {};
    try {
        const checkEmail = await db.User.findOne({
            where: { email: req.body.email },
        });
        if (checkEmail) {
            return res.status(500).json({
                message: "This email already exists",
            });
        }
        if (!validateEmail(req.body.email)) {
            return res.status(500).json({
                message: "The email must be a valid email address.",
            });
        }
        if (req.body.password.length < 6) {
            return res.status(500).json({
                message: "Password must be 6 characters or more",
            });
        }
        result = await CRUDService.createUser(req.body);
        return res.status(200).json({
            message: "OK",
            data: result,
        });
    } catch (err) {
        return res.status(500).json({
            errMessage: result,
        });
    }
};

const login = async (req, res) => {
    let result = {};
    try {
        if (!validateEmail(req.body.email)) {
            return res.status(500).json({
                message: "The email must be a valid email address.",
            });
        }
        result = await CRUDService.userLogin(req.body);

        if (!result) {
            res.status(404).json("Wrong email!");
        }
        const validPassword = await bcrypt.compare(
            req.body.password,
            result.password
        );
        if (!validPassword) {
            res.status(404).json("Wrong password");
        }
        if (result && validPassword) {
            const accessToken = generateToken(
                result,
                process.env.JWT_ACCESS_KEY,
                "3d"
            );
            const refreshToken = generateToken(
                result,
                process.env.JWT_REFRESH_KEY,
                "365d"
            );
            refreshTokens.push(refreshToken);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            const { password, ...others } = result;
            res.status(200).json({ data: others, accessToken });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const generateToken = (user, secretKey, expires) => {
    return jwt.sign(
        {
            id: user.id,
        },
        secretKey,
        {
            expiresIn: expires,
        }
    );
};

const handleRefreshToken = async (req, res) => {
    //Take refreshToken from user
    const refreshToken = req.headers.cookie.split("=")[1];
    if (!refreshToken) return res.status(401).json("You're not authenticated");
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json("Refresh token is not valid");
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
        if (err) {
            console.log(err);
        }
        refreshTokens.filter((token) => token !== refreshToken);
        //Create new accessToken, refreshToken
        const newAccessToken = generateToken(
            user,
            process.env.JWT_ACCESS_KEY,
            "3d"
        );
        const newRefreshToken = generateToken(
            user,
            process.env.JWT_REFRESH_KEY,
            "365d"
        );
        refreshTokens.push(newRefreshToken);
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
        });
        res.status(200).json({ accessToken: newAccessToken });
    });
};

const logout = async (req, res) => {
    res.clearCookie("refreshToken");
    refreshTokens.filter((token) => token !== req.headers.cookie.split("=")[1]);
    res.status(200).json("Logged out!");
};

module.exports = {
    register,
    login,
    logout,
    handleRefreshToken,
};
