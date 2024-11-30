const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const jobSchema = new Schema({
	companyName: { type: String, required: true, uppercase: true },
	jobTitle: { type: String, required: true, trim: true },
	description: { type: String, required: true, trim: true },
	workHours: { type: String, required: true },
	salary: { type: String, required: true },
});

const Job = model("Job", jobSchema);

module.exports = Job;
