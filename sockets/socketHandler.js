const socketIo = require("socket.io");
const Chat = require("../models/chat");

module.exports = function (server) {
	const io = socketIo(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket) => {
		console.log("A user connected:", socket.id);

		// Handle room joining based on unique room identifier (e.g., combination of user IDs)
		socket.on("joinRoom", async (data) => {
			const { employer, applicant } = data;

			if (!employer || !applicant) {
				console.error("Employer or applicant information missing.");
				socket.emit("error", "Employer or applicant information missing.");
				return;
			}

			try {
				// Generate a unique room name using employer and applicant identifiers
				const roomName = `${employer}_${applicant}`;

				// Find or create a chat room for these users
				let chat = await Chat.findOne({
					employer,
					applicant,
				});

				if (!chat) {
					// If no chat exists, create a new one
					chat = new Chat({ employer, applicant });
					await chat.save();
					console.log("New chat room created:", chat._id);
				}

				// Join the generated room
				socket.join(roomName);
				console.log(`User ${socket.id} joined room ${roomName}`);
			} catch (error) {
				console.error("Error in joinRoom:", error);
				socket.emit("error", "Error joining room");
			}
		});

		// Handle incoming messages
		socket.on("sendMessage", async (data) => {
			const { employer, applicant, content, sender } = data;

			console.log("Received sendMessage event with data:", data);

			// Validate incoming data
			if (!employer || !applicant || !content || !sender) {
				console.error("Invalid message data:", data);
				return;
			}

			console.log(
				`Valid data received: employer=${employer}, applicant=${applicant}, content=${content}, sender=${sender}`
			);

			try {
				// Generate the room name using employer and applicant identifiers
				const roomName = `${employer}_${applicant}`;

				// Find the chat document for this employer-applicant pair
				const chat = await Chat.findOne({
					employer,
					applicant,
				});

				if (!chat) {
					console.error(
						`Chat not found for employer=${employer} and applicant=${applicant}`
					);
					return;
				}

				console.log("Chat found:", chat);

				// Add the new message to the chat
				const receiver = sender === employer ? applicant : employer;
				const message = { sender, receiver, content };
				chat.messages.push(message);
				chat.updatedAt = Date.now();

				// Save the chat document with the new message
				await chat.save();
				console.log("Message saved successfully:", message);

				// Emit the message to all clients in the room
				io.to(roomName).emit("receiveMessage", message);
				console.log(`Message emitted to room ${roomName}`);
			} catch (error) {
				console.error("Error in sendMessage handler:", error);
			}
		});

		// Listen for the `receiveMessage` event (optional for confirmation logs)
		socket.on("receiveMessage", (data) => {
			console.log("Message received on client side:", data);
		});

		// Handle disconnection
		socket.on("disconnect", () => {
			console.log("A user disconnected:", socket.id);
		});

		// Handle socket errors
		socket.on("error", (err) => {
			console.error("Socket error:", err);
		});
	});

	return io;
};
