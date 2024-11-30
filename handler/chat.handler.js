const Chat = require("../models/chat");
const User = require("../models/user");
const Job = require("../models/job");

const createChat = async (req, res) => {
	try {
		const { action, employer, applicant } = req.body;

		// Validate the action type
		if (action !== "chat") {
			return res.status(400).json({ error: "Invalid Action" });
		}

		// Ensure both employer and applicant are provided
		if (!employer || !applicant) {
			return res
				.status(400)
				.json({ error: "Employer and Applicant are required." });
		}

		// Find users and employer
		const applicantUser = await User.findOne({ username: applicant });
		const employerUser = await Job.findOne({ companyName: employer });

		if (!employerUser || !applicantUser) {
			return res.status(404).json({
				error: "Employer or Applicant not found in the database",
			});
		}

		// Check if a chat between the employer and applicant already exists
		let chat = await Chat.findOne({ employer, applicant }).populate(
			"messages.sender",
			"username email"
		);

		// If no chat exists, create a new one
		if (!chat) {
			chat = await Chat.create({
				employer,
				applicant,
				messages: [],
			});
		}

		// Respond with the chat details including chatId
		res.status(200).json({ chatId: chat._id, chat });
	} catch (error) {
		console.error("Error creating or retrieving chat:", error);
		res
			.status(500)
			.json({ error: "Server error while creating or retrieving chat." });
	}
};

module.exports = { createChat };
