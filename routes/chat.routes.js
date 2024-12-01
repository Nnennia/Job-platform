const express = require("express");
const { createChat } = require("../handler/chat.handler");

const chatRoute = express.Router();

chatRoute.route("/createChat").post(createChat);

module.exports = chatRoute;
