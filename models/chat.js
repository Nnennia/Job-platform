const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Define the message schema
const messageSchema = new Schema({
	sender: {
		type: Schema.Types.String, // Reference to the User model
		ref: "User",
		required: true,
	},
	receiver: { type: Schema.Types.String, ref: "Job" },
	content: { type: String, required: true }, // Message content
	timestamp: { type: Date, default: Date.now }, // When the message was sent
});

// Define the chat schema
const chatSchema = new Schema({
	employer: {
		type: Schema.Types.String, // Reference to the User model
		ref: "Job",
		required: true,
	},
	applicant: {
		type: Schema.Types.String, // Reference to the User model
		ref: "User",
		required: true,
	},
	messages: [messageSchema], // Array of messages
	createdAt: { type: Date, default: Date.now }, // Timestamp when the chat was created
	updatedAt: { type: Date, default: Date.now }, // Timestamp when the chat was last updated
});

// Export the Chat model
const Chat = model("Chat", chatSchema);
module.exports = Chat;
