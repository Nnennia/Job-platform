const express = require("express");
const { work, upload } = require("../handler/job.handler");
const jobRouter = express.Router();
jobRouter.route("/work").post(upload.single("resume"), work);
module.exports = jobRouter;
