const express = require("express");
const { createChat } = require("../handler/chat.handler");

const chatRoute = express.Router();

// POST route to handle chat creation or retrieval
chatRoute.route("/createChat").post(createChat);

module.exports = chatRoute;
