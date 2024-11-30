const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const applySchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	resume: { type: String },
});
const apply = model("Apply", applySchema);
module.exports = apply;
