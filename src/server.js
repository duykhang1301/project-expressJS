// const express = require('express')
import express from "express";
import configViewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import bodyParser from "body-parser";
import connectDB from "./config/connectDB";

require("dotenv").config();

const app = express();
const port = process.env.PORT || 6969;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

configViewEngine(app);
initWebRoutes(app);

connectDB();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
